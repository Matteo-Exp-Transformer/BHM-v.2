import { useCallback, useEffect, useRef } from 'react'

export const useScrollToForm = (
  isFormVisible: boolean,
  formId = 'onboarding-form'
) => {
  const formRef = useRef<HTMLElement | null>(null)
  const hasScrolledRef = useRef(false)

  const scrollToForm = useCallback(() => {
    if (isFormVisible && formRef.current) {
      window.requestAnimationFrame(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      })
    }
  }, [isFormVisible])

  useEffect(() => {
    if (isFormVisible && !hasScrolledRef.current) {
      hasScrolledRef.current = true
      scrollToForm()
    } else if (!isFormVisible) {
      hasScrolledRef.current = false
    }
  }, [isFormVisible, scrollToForm])

  useEffect(() => {
    if (!formId) return

    const element = document.getElementById(formId)
    if (element) {
      formRef.current = element as HTMLElement
    }

    return () => {
      if (formRef.current && formRef.current.id === formId) {
        formRef.current = null
      }
    }
  }, [formId])

  return { formRef, scrollToForm }
}
