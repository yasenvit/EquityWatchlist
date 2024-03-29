import pymysql

SCHEMA = "equityDB"
con = pymysql.connect('localhost', 'root', 
    '8251', SCHEMA)

class ORM:
    # list of the column names in the table, except for pk
    fields = []

    # name of the table in database
    table = "example"

    # name of the database
    database = "equityDB"

    def __init__(self):
        """ initialize properties for each column in the table """
        self.pk = None

    def save(self):
        """ if a pk exists, update the row to the current values, if it does
        not insert a new row """
        if self.pk:
            self._update()
        else:
            self._insert()

    def _field_value_list(self):
        """ returns a tuple of the values of the columns in the same order as
        the field list """
        values = []
        for fieldname in self.fields:
            values.append(self.__dict__.get(fieldname))
            
        return tuple(values)

    def _insert(self):
        """ insert a new row into the database """
        with con:
            cur = con.cursor()
            fieldnames = ", ".join(self.fields)
            SQLPATTERN = "INSERT INTO {tablename}({fieldnames}) VALUES {values};"
            values = self._field_value_list()
            SQL = SQLPATTERN.format(tablename=self.table, fieldnames=fieldnames, values=values)
            cur.execute(SQL)
            """ cur.lastrowid = pk that was created in the most recent insert """
            self.pk = cur.lastrowid

    def _update(self):
        with con:
            cur = con.cursor()
            SQLPATTERN = "UPDATE {table} SET {pairs} WHERE pk = %s;"
            pairstrings = [
                "{}=%s".format(fieldname) for fieldname in self.fields
            ]
            pairs = ", ".join(pairstrings)
            values = (*self._field_value_list(), self.pk)
            SQL = SQLPATTERN.format(table=self.table, pairs=pairs)
            cur.execute(SQL, values)

    def delete(self):
        """ remove the row corresponding to this object from the table """
        if not self.pk:
            raise ValueError("pk not set for delete operation")

        with con:
            cur = con.cursor()
            SQLPATTERN = "DELETE FROM {table} WHERE pk=%s;"
            SQL = SQLPATTERN.format(table=self.table)
            cur.execute(SQL, (self.pk, ))

    @classmethod
    def _from_row(cls, row):
        """ return a new instance of this class with properties set from a
        dictionary-like object (such as a sqlite3.Row object) """
        #row = dict(row)
        new_obj = cls()
        for column in row:
            """ object.__dict__ contains all of its self.property values as
            a key: value dictionary """
            new_obj.__dict__[column] = row.get(column)
        return new_obj

    @classmethod
    def select_many(cls, where_clause="", values=tuple(), schema=SCHEMA):
        """ provide a WHERE clause to a SELECT statement and return objects
        representing each matched row """
        with con:
            cur = con.cursor()
            SQLPATTERNcol = "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '{table}' AND TABLE_SCHEMA = '{schema}'"
            SQLcol = SQLPATTERNcol.format(table=cls.table, schema=schema)
            cur.execute(SQLcol)
            columnNames = cur.fetchall()

            SQLPATTERN = "SELECT * FROM {table} {where_clause};"
            SQL = SQLPATTERN.format(table=cls.table, where_clause=where_clause)
            cur.execute(SQL, values)
            results = cur.fetchall()
            resultList = []
            for result in results:
                resultDict = {}
                for a in columnNames:
                    i = columnNames.index(a)
                    resultDict[a[0]] = result[i]
                resultList.append(cls._from_row(resultDict))
            return resultList

    @classmethod
    def select_one(cls, where_clause="", values=tuple(), schema=SCHEMA):
        """ provide a WHERE clause and return one object that corresponds to
        the row SELECTED or None if no results matched """
        with con:
            cur = con.cursor()
            SQLPATTERN = "SELECT * FROM {table} {where_clause}"
            SQL = SQLPATTERN.format(table=cls.table, where_clause=where_clause)
            cur.execute(SQL, values)
            result = cur.fetchone()
            SQLPATTERNcol = "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '{table}' AND TABLE_SCHEMA = '{schema}'"
            SQLcol = SQLPATTERNcol.format(table=cls.table, schema=schema)
            cur.execute(SQLcol)
            columnNames = cur.fetchall()
            resultDict = {}
            for a in columnNames:
                i = columnNames.index(a)
                resultDict[a[0]] = result[i]
            if resultDict is None:
                return None
            return cls._from_row(resultDict)

    @classmethod
    def from_pk(cls, pk):
        """ grab the row with the given pk """
        return cls.select_one("WHERE pk = %s", (pk, ))
    
    @classmethod
    def delete_oneormore(cls, where, value):
        with con:
            cur = con.cursor()
            SQLPATTERN = "DELETE FROM {table} {where};"
            SQL = SQLPATTERN.format(table=cls.table, where=where)
            cur.execute(SQL)

            SQL= "SELECT ticker FROM {table} WHERE account_pk = %s ".format(table=cls.table)
            cur.execute(SQL, value)
            itemslist = cur.fetchall()
            result = []
            for item in itemslist:
                result.append(*item)
            print(result)
            return result



class Test(ORM):
    fields = ["field1", "field2"]
    table = "testtable"
    database = "example.db"

    def __init__(self):
        self.pk = None
        self.field1 = None
        self.field2 = None


if __name__ == "__main__":
    t = Test()
    t.field1 = "something"
    t.field2 = "silly"
    t.save()
    t.field2 = "different"
    t.save()

    objects = Test.select_many()
    for obj in objects:
        print("pk = ", obj.pk, obj.field1, obj.field2)
