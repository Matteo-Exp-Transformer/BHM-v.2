import { render, screen } from '@testing-library/react'
import { LoadingSpinner } from '../LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />)
    
    const spinner = screen.getByRole('status')
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveAttribute('aria-label', 'Loading')
    expect(spinner).toHaveClass('animate-spin')
  })

  it('renders different sizes', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />)
    expect(screen.getByRole('status')).toHaveClass('w-4', 'h-4')

    rerender(<LoadingSpinner size="lg" />)
    expect(screen.getByRole('status')).toHaveClass('w-12', 'h-12')
  })

  it('applies custom className', () => {
    render(<LoadingSpinner className="custom-class" />)
    expect(screen.getByRole('status')).toHaveClass('custom-class')
  })

  it('has proper accessibility attributes', () => {
    render(<LoadingSpinner />)
    
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveAttribute('aria-label', 'Loading')
    
    const srOnlyText = screen.getByText('Loading...')
    expect(srOnlyText).toHaveClass('sr-only')
  })

  it('has proper styling for animation', () => {
    render(<LoadingSpinner />)
    
    const spinnerElement = screen.getByRole('status').firstChild as HTMLElement
    expect(spinnerElement).toHaveClass(
      'animate-spin',
      'rounded-full',
      'border-2',
      'border-gray-300',
      'border-t-blue-600'
    )
  })
})
