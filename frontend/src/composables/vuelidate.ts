import { ErrorObject, BaseValidation } from '@vuelidate/core'

export default function validationHelpers() {
  const vuelidateErrors = (errors: Array<ErrorObject>) => errors.reduce((a: string, b: ErrorObject, i: number) => a + `${i + 1}. ${b.$message} \n`, "")
  function passValidation(v$: BaseValidation): Promise<boolean> {
    return new Promise((resolve, error) => {
      if (!v$) {
        error(true)
        return console.error("You must define your v$ validations in the component or pass the v$ object that you want to validate against as a parameter")
      } else {
        v$.$reset()
        v$.$touch()
        if (v$.$invalid) {
          error(true)
          return console.error("Please make sure all form requirements are filled and correct")
        }
        resolve(true)
      }
    })
  }

  return { vuelidateErrors, passValidation }
}