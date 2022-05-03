import { ErrorObject, BaseValidation } from '@vuelidate/core'
import { Notify } from 'quasar'

function notification(message: string, type: string) {
  Notify.create({
    message: message,
    color: type == 'error' ? 'red' : 'cyan',
    timeout: 2000,
    position: 'top'
  })
}

export default function validationHelpers() {
  const vuelidateErrors = (errors: Array<ErrorObject>) => errors.reduce((a: string, b: ErrorObject, i: number) => a + `${i + 1}. ${b.$message} \n`, '')
  function passValidation(v$: BaseValidation): Promise<boolean> {
    return new Promise((resolve, error) => {
      if (!v$) {
        error(true)
        notification(
          'You must define your v$ validations in the component or pass the v$ object that you want to validate against as a parameter',
          'error'
        )
        return
      } else {
        v$.$reset()
        v$.$touch()
        if (v$.$invalid) {
          error(true)
          notification(
            'Please make sure all form requirements are filled and correct',
            'error'
          )
          return
        }
        resolve(true)
      }
    })
  }

  return { vuelidateErrors, passValidation }
}