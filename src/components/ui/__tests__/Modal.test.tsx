import { render, screen, fireEvent } from '@testing-library/react'
import { Modal, ModalActions } from '../Modal'

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    title: 'Test Modal'
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders when open', () => {
    render(
      <Modal {...defaultProps}>
        <p>Modal content</p>
      </Modal>
    )
    
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Test Modal')).toBeInTheDocument()
    expect(screen.getByText('Modal content')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(
      <Modal {...defaultProps} isOpen={false}>
        <p>Modal content</p>
      </Modal>
    )
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = jest.fn()
    render(
      <Modal {...defaultProps} onClose={onClose}>
        <p>Modal content</p>
      </Modal>
    )
    
    const closeButton = screen.getByLabelText('Close modal')
    fireEvent.click(closeButton)
    
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when escape key is pressed', () => {
    const onClose = jest.fn()
    render(
      <Modal {...defaultProps} onClose={onClose}>
        <p>Modal content</p>
      </Modal>
    )
    
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when overlay is clicked', () => {
    const onClose = jest.fn()
    render(
      <Modal {...defaultProps} onClose={onClose}>
        <p>Modal content</p>
      </Modal>
    )
    
    const overlay = screen.getByRole('dialog').parentElement
    fireEvent.click(overlay!)
    
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not close when modal content is clicked', () => {
    const onClose = jest.fn()
    render(
      <Modal {...defaultProps} onClose={onClose}>
        <p>Modal content</p>
      </Modal>
    )
    
    const modalContent = screen.getByText('Modal content')
    fireEvent.click(modalContent)
    
    expect(onClose).not.toHaveBeenCalled()
  })

  it('renders different sizes', () => {
    const { rerender } = render(
      <Modal {...defaultProps} size="sm">
        <p>Small modal</p>
      </Modal>
    )
    expect(screen.getByRole('dialog')).toHaveClass('max-w-md')

    rerender(
      <Modal {...defaultProps} size="lg">
        <p>Large modal</p>
      </Modal>
    )
    expect(screen.getByRole('dialog')).toHaveClass('max-w-2xl')
  })

  it('can hide close button', () => {
    render(
      <Modal {...defaultProps} showCloseButton={false}>
        <p>Modal content</p>
      </Modal>
    )
    
    expect(screen.queryByLabelText('Close modal')).not.toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(
      <Modal {...defaultProps}>
        <p>Modal content</p>
      </Modal>
    )
    
    const modal = screen.getByRole('dialog')
    expect(modal).toHaveAttribute('aria-modal', 'true')
    expect(modal).toHaveAttribute('aria-labelledby', 'modal-title')
    
    const title = screen.getByText('Test Modal')
    expect(title).toHaveAttribute('id', 'modal-title')
  })

  it('prevents body scroll when open', () => {
    render(
      <Modal {...defaultProps}>
        <p>Modal content</p>
      </Modal>
    )
    
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('restores body scroll when closed', () => {
    const { rerender } = render(
      <Modal {...defaultProps}>
        <p>Modal content</p>
      </Modal>
    )
    
    rerender(
      <Modal {...defaultProps} isOpen={false}>
        <p>Modal content</p>
      </Modal>
    )
    
    expect(document.body.style.overflow).toBe('unset')
  })

  it('can disable escape key close', () => {
    const onClose = jest.fn()
    render(
      <Modal {...defaultProps} onClose={onClose} closeOnEscape={false}>
        <p>Modal content</p>
      </Modal>
    )
    
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).not.toHaveBeenCalled()
  })

  it('can disable overlay click close', () => {
    const onClose = jest.fn()
    render(
      <Modal {...defaultProps} onClose={onClose} closeOnOverlayClick={false}>
        <p>Modal content</p>
      </Modal>
    )
    
    const overlay = screen.getByRole('dialog').parentElement
    fireEvent.click(overlay!)
    
    expect(onClose).not.toHaveBeenCalled()
  })
})

describe('ModalActions', () => {
  it('renders actions correctly', () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()} title="Test Modal">
        <p>Modal content</p>
        <ModalActions>
          <button>Cancel</button>
          <button>Save</button>
        </ModalActions>
      </Modal>
    )
    
    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByText('Save')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()} title="Test Modal">
        <ModalActions className="custom-actions">
          <button>Action</button>
        </ModalActions>
      </Modal>
    )
    
    expect(screen.getByText('Action').closest('div')).toHaveClass('custom-actions')
  })
})
