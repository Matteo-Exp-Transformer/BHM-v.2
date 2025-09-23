import { render, screen, fireEvent } from '@testing-library/react'
import { Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell } from '../Table'

describe('Table', () => {
  it('renders with caption', () => {
    render(
      <Table caption="Test table">
        <tbody>
          <tr>
            <td>Cell content</td>
          </tr>
        </tbody>
      </Table>
    )
    
    const table = screen.getByRole('table')
    expect(table).toBeInTheDocument()
    
    const caption = screen.getByText('Test table')
    expect(caption).toHaveClass('sr-only')
  })

  it('applies custom className', () => {
    render(
      <Table className="custom-table">
        <tbody>
          <tr>
            <td>Cell content</td>
          </tr>
        </tbody>
      </Table>
    )
    
    const table = screen.getByRole('table')
    expect(table).toHaveClass('custom-table')
  })
})

describe('TableHeader', () => {
  it('renders with default styling', () => {
    render(
      <Table>
        <TableHeader>
          <tr>
            <th>Header</th>
          </tr>
        </TableHeader>
      </Table>
    )
    
    const header = screen.getByRole('columnheader')
    expect(header).toBeInTheDocument()
  })
})

describe('TableBody', () => {
  it('renders with default styling', () => {
    render(
      <Table>
        <TableBody>
          <tr>
            <td>Cell</td>
          </tr>
        </TableBody>
      </Table>
    )
    
    const cell = screen.getByRole('cell')
    expect(cell).toBeInTheDocument()
  })
})

describe('TableRow', () => {
  it('renders as clickable when onClick is provided', () => {
    const handleClick = jest.fn()
    render(
      <Table>
        <tbody>
          <TableRow onClick={handleClick}>
            <TableCell>Cell content</TableCell>
          </TableRow>
        </tbody>
      </Table>
    )
    
    const row = screen.getByRole('button')
    expect(row).toBeInTheDocument()
    expect(row).toHaveAttribute('tabIndex', '0')
    
    fireEvent.click(row)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('supports keyboard navigation', () => {
    const handleClick = jest.fn()
    render(
      <Table>
        <tbody>
          <TableRow onClick={handleClick}>
            <TableCell>Cell content</TableCell>
          </TableRow>
        </tbody>
      </Table>
    )
    
    const row = screen.getByRole('button')
    
    // Focus and press Enter
    row.focus()
    fireEvent.keyDown(row, { key: 'Enter' })
    expect(handleClick).toHaveBeenCalledTimes(1)
    
    // Press Space
    fireEvent.keyDown(row, { key: ' ' })
    expect(handleClick).toHaveBeenCalledTimes(2)
  })

  it('shows selected state', () => {
    render(
      <Table>
        <tbody>
          <TableRow selected>
            <TableCell>Cell content</TableCell>
          </TableRow>
        </tbody>
      </Table>
    )
    
    const row = screen.getByRole('row')
    expect(row).toHaveAttribute('aria-selected', 'true')
    expect(row).toHaveClass('bg-primary-50')
  })

  it('applies custom className', () => {
    render(
      <Table>
        <tbody>
          <TableRow className="custom-row">
            <TableCell>Cell content</TableCell>
          </TableRow>
        </tbody>
      </Table>
    )
    
    const row = screen.getByRole('row')
    expect(row).toHaveClass('custom-row')
  })
})

describe('TableHeaderCell', () => {
  it('renders as sortable', () => {
    const handleSort = jest.fn()
    render(
      <Table>
        <thead>
          <tr>
            <TableHeaderCell sortable onSort={handleSort}>
              Sortable Header
            </TableHeaderCell>
          </tr>
        </thead>
      </Table>
    )
    
    const header = screen.getByRole('button')
    expect(header).toBeInTheDocument()
    expect(header).toHaveAttribute('aria-sort', 'none')
    
    fireEvent.click(header)
    expect(handleSort).toHaveBeenCalledTimes(1)
  })

  it('shows sort direction', () => {
    const { rerender } = render(
      <Table>
        <thead>
          <tr>
            <TableHeaderCell sortable sortDirection="asc">
              Ascending
            </TableHeaderCell>
          </tr>
        </thead>
      </Table>
    )
    
    expect(screen.getByRole('button')).toHaveAttribute('aria-sort', 'ascending')
    expect(screen.getByText('↑')).toBeInTheDocument()

    rerender(
      <Table>
        <thead>
          <tr>
            <TableHeaderCell sortable sortDirection="desc">
              Descending
            </TableHeaderCell>
          </tr>
        </thead>
      </Table>
    )
    
    expect(screen.getByRole('button')).toHaveAttribute('aria-sort', 'descending')
    expect(screen.getByText('↓')).toBeInTheDocument()
  })

  it('supports keyboard navigation for sorting', () => {
    const handleSort = jest.fn()
    render(
      <Table>
        <thead>
          <tr>
            <TableHeaderCell sortable onSort={handleSort}>
              Sortable Header
            </TableHeaderCell>
          </tr>
        </thead>
      </Table>
    )
    
    const header = screen.getByRole('button')
    
    // Focus and press Enter
    header.focus()
    fireEvent.keyDown(header, { key: 'Enter' })
    expect(handleSort).toHaveBeenCalledTimes(1)
    
    // Press Space
    fireEvent.keyDown(header, { key: ' ' })
    expect(handleSort).toHaveBeenCalledTimes(2)
  })

  it('applies custom className', () => {
    render(
      <Table>
        <thead>
          <tr>
            <TableHeaderCell className="custom-header">
              Header
            </TableHeaderCell>
          </tr>
        </thead>
      </Table>
    )
    
    const header = screen.getByRole('columnheader')
    expect(header).toHaveClass('custom-header')
  })
})

describe('TableCell', () => {
  it('renders cell content', () => {
    render(
      <Table>
        <tbody>
          <tr>
            <TableCell>Cell content</TableCell>
          </tr>
        </tbody>
      </Table>
    )
    
    const cell = screen.getByRole('cell')
    expect(cell).toBeInTheDocument()
    expect(cell).toHaveTextContent('Cell content')
  })

  it('applies custom className', () => {
    render(
      <Table>
        <tbody>
          <tr>
            <TableCell className="custom-cell">
              Cell content
            </TableCell>
          </tr>
        </tbody>
      </Table>
    )
    
    const cell = screen.getByRole('cell')
    expect(cell).toHaveClass('custom-cell')
  })
})
