import { render, screen } from '@testing-library/react';
import { Table, TableColumn } from '../table';

interface Row {
  id: string;
  name: string;
}

const columns: TableColumn<Row>[] = [
  { key: 'name', header: 'Name', accessor: (row) => row.name }
];

describe('Table', () => {
  it('renders the empty message when there are no rows', () => {
    render(<Table columns={columns} rows={[]} rowKey={(row) => row.id} />);
    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  it('renders a custom empty message', () => {
    render(<Table columns={columns} rows={[]} rowKey={(row) => row.id} emptyMessage="Nothing here" />);
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('renders column headers and row data', () => {
    const rows: Row[] = [{ id: '1', name: 'Alice' }, { id: '2', name: 'Bob' }];
    render(<Table columns={columns} rows={rows} rowKey={(row) => row.id} />);

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });
});
