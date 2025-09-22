import { render, screen, fireEvent } from '@testing-library/react'
import { FormField, Input, Select, TextArea } from '../FormField'

describe('FormField', () => {
  it('renders label correctly', () => {
    render(
      <FormField label="Test Label" id="test-field">
        <Input id="test-field" />
      </FormField>
    )
    
    expect(screen.getByLabelText('Test Label')).toBeInTheDocument()
    expect(screen.getByLabelText('Test Label')).toHaveAttribute('id', 'test-field')
  })

  it('shows required indicator', () => {
    render(
      <FormField label="Required Field" id="test-field" required>
        <Input id="test-field" />
      </FormField>
    )
    
    const requiredIndicator = screen.getByLabelText('required')
    expect(requiredIndicator).toBeInTheDocument()
    expect(requiredIndicator).toHaveTextContent('*')
  })

  it('displays error message', () => {
    render(
      <FormField label="Test Field" id="test-field" error="This field is required">
        <Input id="test-field" />
      </FormField>
    )
    
    const errorMessage = screen.getByRole('alert')
    expect(errorMessage).toBeInTheDocument()
    expect(errorMessage).toHaveTextContent('This field is required')
    expect(errorMessage).toHaveAttribute('aria-live', 'polite')
  })

  it('displays help text', () => {
    render(
      <FormField label="Test Field" id="test-field" helpText="This is help text">
        <Input id="test-field" />
      </FormField>
    )
    
    const helpText = screen.getByText('This is help text')
    expect(helpText).toBeInTheDocument()
    expect(helpText).toHaveAttribute('id', 'test-field-help')
  })

  it('prioritizes error over help text', () => {
    render(
      <FormField 
        label="Test Field" 
        id="test-field" 
        helpText="Help text"
        error="Error message"
      >
        <Input id="test-field" />
      </FormField>
    )
    
    expect(screen.getByText('Error message')).toBeInTheDocument()
    expect(screen.queryByText('Help text')).not.toBeInTheDocument()
  })
})

describe('Input', () => {
  it('renders with default props', () => {
    render(<Input id="test-input" />)
    
    const input = screen.getByRole('textbox')
    expect(input).toBeInTheDocument()
    expect(input).toHaveClass('border-gray-300')
  })

  it('handles error state', () => {
    render(<Input id="test-input" error />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('border-red-300')
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  it('handles value changes', () => {
    const handleChange = jest.fn()
    render(<Input id="test-input" onChange={handleChange} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'test value' } })
    
    expect(handleChange).toHaveBeenCalled()
    expect(input).toHaveValue('test value')
  })

  it('supports different input types', () => {
    const { rerender } = render(<Input id="test-input" type="email" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email')

    rerender(<Input id="test-input" type="password" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'password')
  })
})

describe('Select', () => {
  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3', disabled: true }
  ]

  it('renders options correctly', () => {
    render(<Select id="test-select" options={options} />)
    
    const select = screen.getByRole('combobox')
    expect(select).toBeInTheDocument()
    
    expect(screen.getByText('Option 1')).toBeInTheDocument()
    expect(screen.getByText('Option 2')).toBeInTheDocument()
    expect(screen.getByText('Option 3')).toBeInTheDocument()
  })

  it('handles disabled options', () => {
    render(<Select id="test-select" options={options} />)
    
    const option3 = screen.getByRole('option', { name: 'Option 3' })
    expect(option3).toBeDisabled()
  })

  it('handles error state', () => {
    render(<Select id="test-select" options={options} error />)
    
    const select = screen.getByRole('combobox')
    expect(select).toHaveClass('border-red-300')
    expect(select).toHaveAttribute('aria-invalid', 'true')
  })

  it('handles selection changes', () => {
    const handleChange = jest.fn()
    render(<Select id="test-select" options={options} onChange={handleChange} />)
    
    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: 'option2' } })
    
    expect(handleChange).toHaveBeenCalled()
    expect(select).toHaveValue('option2')
  })
})

describe('TextArea', () => {
  it('renders with default props', () => {
    render(<TextArea id="test-textarea" />)
    
    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeInTheDocument()
    expect(textarea).toHaveClass('border-gray-300')
  })

  it('handles error state', () => {
    render(<TextArea id="test-textarea" error />)
    
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveClass('border-red-300')
    expect(textarea).toHaveAttribute('aria-invalid', 'true')
  })

  it('handles value changes', () => {
    const handleChange = jest.fn()
    render(<TextArea id="test-textarea" onChange={handleChange} />)
    
    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'test content' } })
    
    expect(handleChange).toHaveBeenCalled()
    expect(textarea).toHaveValue('test content')
  })

  it('supports rows attribute', () => {
    render(<TextArea id="test-textarea" rows={5} />)
    
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('rows', '5')
  })
})
