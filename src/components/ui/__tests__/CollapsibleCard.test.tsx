import { render, screen, fireEvent } from '@testing-library/react'
import { CollapsibleCard, CardActionButton } from '../CollapsibleCard'

// Mock icon component
const TestIcon = ({ className }: { className?: string }) => (
  <span data-testid="test-icon" className={className}>📊</span>
)

describe('CollapsibleCard', () => {
  const defaultProps = {
    title: 'Test Card',
    children: <p>Card content</p>
  }

  it('renders with default props', () => {
    render(<CollapsibleCard {...defaultProps} />)
    
    expect(screen.getByText('Test Card')).toBeInTheDocument()
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('renders with icon', () => {
    render(<CollapsibleCard {...defaultProps} icon={TestIcon} />)
    
    expect(screen.getByTestId('test-icon')).toBeInTheDocument()
  })

  it('renders with subtitle', () => {
    render(<CollapsibleCard {...defaultProps} subtitle="Test subtitle" />)
    
    expect(screen.getByText('Test subtitle')).toBeInTheDocument()
  })

  it('renders with counter', () => {
    render(<CollapsibleCard {...defaultProps} counter={5} />)
    
    const counter = screen.getByLabelText('5 items')
    expect(counter).toBeInTheDocument()
    expect(counter).toHaveTextContent('5')
  })

  it('toggles expansion on header click', () => {
    render(<CollapsibleCard {...defaultProps} />)
    
    const header = screen.getByRole('button')
    const content = screen.getByText('Card content')
    
    // Initially expanded by default
    expect(content).toBeInTheDocument()
    
    // Click to collapse
    fireEvent.click(header)
    expect(screen.queryByText('Card content')).not.toBeInTheDocument()
    
    // Click to expand again
    fireEvent.click(header)
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('toggles expansion on toggle button click', () => {
    render(<CollapsibleCard {...defaultProps} />)
    
    const toggleButton = screen.getByLabelText('Collapse section')
    screen.getByText('Card content')
    
    // Click toggle button
    fireEvent.click(toggleButton)
    expect(screen.queryByText('Card content')).not.toBeInTheDocument()
    
    // Click toggle button again
    fireEvent.click(screen.getByLabelText('Expand section'))
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('supports keyboard navigation', () => {
    render(<CollapsibleCard {...defaultProps} />)
    
    const header = screen.getByRole('button')
    
    // Focus and press Enter
    header.focus()
    fireEvent.keyDown(header, { key: 'Enter' })
    expect(screen.queryByText('Card content')).not.toBeInTheDocument()
    
    // Press Space
    fireEvent.keyDown(header, { key: ' ' })
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('starts collapsed when defaultExpanded is false', () => {
    render(<CollapsibleCard {...defaultProps} defaultExpanded={false} />)
    
    expect(screen.queryByText('Card content')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Expand section')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(<CollapsibleCard {...defaultProps} loading />)
    
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText('Caricamento...')).toBeInTheDocument()
    expect(screen.queryByText('Card content')).not.toBeInTheDocument()
  })

  it('shows error state', () => {
    render(<CollapsibleCard {...defaultProps} error="Something went wrong" />)
    
    const errorAlert = screen.getByRole('alert')
    expect(errorAlert).toBeInTheDocument()
    expect(errorAlert).toHaveTextContent('Something went wrong')
    expect(errorAlert).toHaveAttribute('aria-live', 'assertive')
    expect(screen.queryByText('Card content')).not.toBeInTheDocument()
  })

  it('shows empty state', () => {
    render(<CollapsibleCard {...defaultProps} showEmpty emptyMessage="No items" />)
    
    expect(screen.getByText('No items')).toBeInTheDocument()
    expect(screen.queryByText('Card content')).not.toBeInTheDocument()
  })

  it('renders actions', () => {
    const actions = <button>Action</button>
    render(<CollapsibleCard {...defaultProps} actions={actions} />)
    
    expect(screen.getByText('Action')).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<CollapsibleCard {...defaultProps} />)
    
    const card = screen.getByRole('region')
    expect(card).toHaveAttribute('aria-labelledby')
    
    const header = screen.getByRole('button')
    expect(header).toHaveAttribute('aria-expanded', 'true')
    expect(header).toHaveAttribute('aria-controls')
    
    const content = screen.getByText('Card content')
    expect(content.closest('div')).toHaveAttribute('role', 'region')
  })

  it('applies custom className', () => {
    render(<CollapsibleCard {...defaultProps} className="custom-class" />)
    
    const card = screen.getByRole('region')
    expect(card).toHaveClass('custom-class')
  })
})

describe('CardActionButton', () => {
  const defaultProps = {
    icon: TestIcon,
    label: 'Test Action',
    onClick: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders with default variant', () => {
    render(<CardActionButton {...defaultProps} />)
    
    const button = screen.getByLabelText('Test Action')
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('bg-gray-100')
  })

  it('renders different variants', () => {
    const { rerender } = render(<CardActionButton {...defaultProps} variant="primary" />)
    expect(screen.getByLabelText('Test Action')).toHaveClass('bg-blue-100')

    rerender(<CardActionButton {...defaultProps} variant="danger" />)
    expect(screen.getByLabelText('Test Action')).toHaveClass('bg-red-100')
  })

  it('handles click events', () => {
    const onClick = jest.fn()
    render(<CardActionButton {...defaultProps} onClick={onClick} />)
    
    fireEvent.click(screen.getByLabelText('Test Action'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('handles disabled state', () => {
    render(<CardActionButton {...defaultProps} disabled />)
    
    const button = screen.getByLabelText('Test Action')
    expect(button).toBeDisabled()
  })

  it('renders icon', () => {
    render(<CardActionButton {...defaultProps} />)
    
    expect(screen.getByTestId('test-icon')).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<CardActionButton {...defaultProps} />)
    
    const button = screen.getByLabelText('Test Action')
    expect(button).toHaveClass('focus:outline-none', 'focus:ring-2')
    
    const icon = screen.getByTestId('test-icon')
    expect(icon).toHaveAttribute('aria-hidden', 'true')
  })
})
