import React from 'react';
import PropTypes from 'prop-types';
import { lighten, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Paper from '@material-ui/core/Paper';
import {Route, Link} from 'react-router-dom';


function createData(symbol,latestPrice,marketCap,avgTotalVolume,peRatio,week52Low,week52High,
  change,changePercent,ytdChange,open,close,low,high) {
           return { symbol,latestPrice,marketCap,avgTotalVolume,peRatio,week52Low,week52High,
            change,changePercent,ytdChange,open,close,low,high };
  }

const rows = (data) => {
  return data.map((obj, index) => (
    createData(
    obj.symbol, obj.latestPrice, obj.marketCap, obj.avgTotalVolume, obj.peRatio,obj.week52Low,
    obj.week52High, obj.change, obj.changePercent, obj.ytdChange,obj.open, obj.close, obj.low,obj.high, index
    )
  ))
  }

function desc(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function stableSort(array, cmp) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = cmp(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map(el => el[0]);
}

function getSorting(order, orderBy) {
  return order === 'desc' ? (a, b) => desc(a, b, orderBy) : (a, b) => -desc(a, b, orderBy);
}

const headRows = [
    { id: 'symbol', numeric: false, disablePadding: false, label: 'symbol' },
    { id: 'latestPrice', numeric: true, disablePadding: false, label: 'latestPrice' },
    { id: 'marketCap', numeric: true, disablePadding: false, label: 'marketCap' },
    { id: 'avgTotalVolume', numeric: true, disablePadding: false, label: 'avgTotalVolume' },
    { id: 'peRatio', numeric: true, disablePadding: false, label: 'peRatio' },
    { id: 'week52Low', numeric: true, disablePadding: false, label: 'week52Low' },
    { id: 'week52High', numeric: true, disablePadding: false, label: 'week52High'},
    { id: 'change', numeric: true, disablePadding: false, label: 'change'},
    { id: 'changePercent', numeric: true, disablePadding: false, label: 'changePercent'},
    { id: 'ytdChange', numeric: true, disablePadding: false, label: 'ytdChange'},
    { id: 'open', numeric: true, disablePadding: false, label: 'open' },
    { id: 'close', numeric: true, disablePadding: false, label: 'close' },
    { id: 'low', numeric: true, disablePadding: false, label: 'low' },
    { id: 'high', numeric: true, disablePadding: false, label: 'high' }
  ];

/******************************************************************************************************/

function EnhancedTableHead(props) {
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort} = props;
  const createSortHandler = property => event => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell>
          add to watchlist
        </TableCell>
        {headRows.map(row => (
          <TableCell
            key={row.id}
            align={row.numeric ? 'right' : 'left'}
            padding={row.disablePadding ? 'none' : 'default'}
            sortDirection={orderBy === row.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === row.id}
              direction={order}
              onClick={createSortHandler(row.id)}
            >
              {row.label}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.string.isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
  };

const useToolbarStyles = makeStyles(theme => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
  },
  highlight:
    theme.palette.type === 'light'
      ? {
          color: theme.palette.secondary.main,
          backgroundColor: lighten(theme.palette.secondary.light, 0.85),
        }
      : {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.secondary.dark,
        },
  spacer: {
    flex: '1 1 100%',
  },
  actions: {
    color: theme.palette.text.secondary,
  },
  title: {
    flex: '0 0 auto',
  },
}));

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing(3),
  },
  paper: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 750,
  },
  tableWrapper: {
    overflowX: 'auto',
  },
}));

export default function EnhancedTable(props) {
  const { listTen, addSymbol, setChartsTicker } = props
  const classes = useStyles();
  const [order, setOrder] = React.useState('desc');
  const [orderBy, setOrderBy] = React.useState('marketCap');
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  // const [dense, setDense] = React.useState(false);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  function handleRequestSort(event, property) {
    const isDesc = orderBy === property && order === 'desc';
    setOrder(isDesc ? 'asc' : 'desc');
    setOrderBy(property);
  }


  function handleSelectAllClick(event) {
    if (event.target.checked) {
      const newSelecteds = rows(listTen).map(n => n.symbol);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  }

  function handleClick(event, symbol) {

    const selectedIndex = selected.indexOf(symbol);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, symbol);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  }

  function handleChangePage(event, newPage) {
    setPage(newPage);
  }

  function handleChangeRowsPerPage(event) {
    setRowsPerPage(+event.target.value);
    setPage(0);
  }

  // function handleChangeDense(event) {
  //   setDense(event.target.checked);
  // }

  const isSelected = symbol => selected.indexOf(symbol) !== -1;

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows(listTen).length - page * rowsPerPage);
console.log(selected)
  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <div className={classes.tableWrapper}>
          <Table
            className={classes.table}
            aria-labelledby="tableTitle"
            size={'small'}
            // size={dense ? 'medium' : 'small'}
          >
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              // onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={rows(listTen).length}
            />
            
            <TableBody>
              {stableSort(rows(listTen), getSorting(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  const isItemSelected = isSelected(row.symbol);
                  const labelId = `enhanced-table-checkbox-${index}`;
                  return (
                    <TableRow
                      hover
                      onClick={event => handleClick(event, row.symbol)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.symbol}
                      selected={isItemSelected}
                      setChartsTicker={setChartsTicker}
                      addSymbol={addSymbol}
                    >
                      <TableCell padding="">
                        <button onClick={(e)=>{addSymbol(row.symbol)}} style={{marginRight:"10px", width:"80px"}}>
                          
                          + add
                          
                        </button>
                      </TableCell>
                      <TableCell component="th" id={labelId} scope="row" padding="none">
                        <Link 
                          style={{textDecoration:"none", color:"rgb(28, 104, 243)"}}
                          onClick={(e)=>{setChartsTicker(row.symbol)}}
                          to={`/dashboard/lookup/summary/${row.symbol}`}
                        >
                          {row.symbol}
                        </Link>
                      </TableCell>
                      <TableCell align="right">{row.latestPrice}</TableCell>
                      <TableCell align="right">{row.marketCap}</TableCell>
                      <TableCell align="right">{row.avgTotalVolume}</TableCell>
                      <TableCell align="right">{row.peRatio}</TableCell>
                      <TableCell align="right">{row.week52Low}</TableCell>
                      <TableCell align="right">{row.week52High}</TableCell>
                      <TableCell align="right">{row.change}</TableCell>
                      <TableCell align="right">{row.changePercent}</TableCell>
                      <TableCell align="right">{row.ytdChange}</TableCell>
                      <TableCell align="right">{row.open}</TableCell>
                      <TableCell align="right">{row.close}</TableCell>
                      <TableCell align="right">{row.low}</TableCell>
                      <TableCell align="right">{row.high}</TableCell>
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow style={{ height: 49 * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={rows(listTen).length}
          rowsPerPage={rowsPerPage}
          page={page}
          backIconButtonProps={{
            'aria-label': 'Previous Page',
          }}
          nextIconButtonProps={{
            'aria-label': 'Next Page',
          }}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Paper>
    </div>
  );
}
