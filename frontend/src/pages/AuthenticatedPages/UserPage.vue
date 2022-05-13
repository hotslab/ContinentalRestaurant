<template>
  <q-page class="q-pa-md">
    <q-card v-if="!showEdiSection" flat bordered class="no-shadow" style="width:320px;">
      <q-card-section class="flex justify-center items-center">
        <q-icon size="150px" color="primary" name="account_circle" />
      </q-card-section>
      <q-card-section class="flex justify-between items-center">
        <div class="text-h6 text-light text-primary">
          Profile 
        </div>
        <q-btn unelevated size="md" color="primary" label="Edit" @click="toggleEditing(true)" />
      </q-card-section>
      <q-list>
        <q-item>
          <q-item-section>
            <q-item-label caption>Name</q-item-label>
            <q-item-label>{{ user?.name || '-' }}</q-item-label>
          </q-item-section>
          <q-item-section avatar>
            <q-icon color="orange" name="person" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label caption>Surname</q-item-label>
            <q-item-label>{{ user?.surname || '-' }}</q-item-label>
          </q-item-section>
          <q-item-section avatar>
            <q-icon color="secondary" name="person_outline" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label caption>Email</q-item-label>
            <q-item-label>{{ user?.email }}</q-item-label>
          </q-item-section>
          <q-item-section avatar>
            <q-icon color="red" name="email" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label caption>Role</q-item-label>
            <q-item-label>{{ user?.role }}</q-item-label>
          </q-item-section>
          <q-item-section avatar>
            <q-icon color="primary" name="security" />
          </q-item-section>
        </q-item>
      </q-list>    
    </q-card>
    <q-card v-else flat bordered class="no-shadow" style="width:320px;">
      <q-card-section class="flex justify-between items-center">
        <div class="text-h6 text-light text-primary">
          Edit {{ `${user?.name} ${user?.surname}` }}
        </div>
      </q-card-section>
      <q-card-section>
        <q-input 
          v-model="editUser.name.value" 
          stack-label 
          label="Name" 
          :error-message="vuelidateErrors(v$.editUser.name.$silentErrors)"
          :error="v$.editUser.name.$invalid"
        />
        <q-input 
          v-model="editUser.surname.value" 
          stack-label 
          label="Surname" 
          :error-message="vuelidateErrors(v$.editUser.surname.$silentErrors)"
          :error="v$.editUser.surname.$invalid"
        />
        <q-input 
          v-model="editUser.email.value" 
          stack-label 
          label="Email" 
          :error-message="vuelidateErrors(v$.editUser.email.$silentErrors)"
          :error="v$.editUser.email.$invalid"
        />
        <q-select 
          v-if="$store.user?.role == 'manager' "
          v-model="editUser.role.value" 
          :options="roles"
          label="Role"
          :error-message="vuelidateErrors(v$.editUser.role.$silentErrors)"
          :error="v$.editUser.role.$invalid" 
        />
        <q-input 
          v-model="editUser.password.value" 
          stack-label 
          label="Password" 
          :error-message="vuelidateErrors(v$.editUser.password.$silentErrors)"
          :error="v$.editUser.password.$invalid"
        />
        <q-input 
          v-model="editUser.confirmPassword.value" 
          stack-label 
          label="Confirm Password" 
          :error-message="vuelidateErrors(v$.editUser.confirmPassword.$silentErrors)"
          :error="v$.editUser.confirmPassword.$invalid"
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          unelevated 
          class="no-shadow q-mt-md"
          color="negative"
          size="md"
          :no-caps="true"
          label="Cancel"
          @click="toggleEditing()"
        />
        <q-btn
          unelevated 
          class="no-shadow q-mt-md"
          color="primary"
          size="md"
          :no-caps="true"
          label="Update"
          @click="updateUser()"
        />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'
import User from 'src/models/User'
import { useStore } from 'src/stores/mainStore'
import { router } from 'src/router'
import { useRoute } from 'vue-router'
import useValidations from 'src/composables/vuelidate'
import { useVuelidate } from '@vuelidate/core'
import { required, requiredIf, email, sameAs } from '@vuelidate/validators'


const user = ref<User | null>(null)
const showEdiSection = ref<boolean>(false)
const roles = ['manager', 'user']
const editUser = {
  name: ref<string | null | undefined>(null),
  surname: ref<string | null | undefined>(null),
  email: ref<string | null | undefined>(null),
  role: ref<string | null | undefined>(null),
  password: ref<string | undefined>(''),
  confirmPassword: ref<string | undefined>('')
}

const isAuthUser = computed(() => $store.user?._id == $route.query.id)
const passwordActivated = computed(() => { if (editUser.password.value) {return true} else {return false} })
const rules = computed(() => { return { 
  editUser: {
    name: { required },
    surname: { required },
    email: { required, email },
    role: { required },
    password: { required: requiredIf(passwordActivated.value) },
    confirmPassword: { 
      required: requiredIf(passwordActivated.value), 
      sameAsPassword: sameAs(editUser.password.value) 
    }
  }
}})

const $store = useStore()
const $q = useQuasar()
const $route = useRoute()
const v$ = useVuelidate(rules, { editUser } )
const { passValidation, vuelidateErrors } = useValidations()

function toggleEditing(setUser = false): void {
  showEdiSection.value = setUser
  editUser.name.value = setUser ? user.value?.name : null
  editUser.surname.value = setUser ? user.value?.surname : null
  editUser.email.value = setUser ? user.value?.email : null
  editUser.role.value = setUser ? user.value?.role : null
  if (setUser) {
    editUser.password.value = ''
    editUser.confirmPassword.value = ''
  }
}
function notification(message: string, type: string) {
  $q.notify({
    message: message,
    color: type == 'error' ? 'red' : 'cyan',
    timeout: 2000,
    position: 'top'
  })
}
function logOut(): void {
  $store.setUser(null)
  router.push({name: 'login'})
}
function checkLoggedInUserDetailsUnchanged(): boolean {
  return editUser.name.value == $store.user?.name
    && editUser.surname.value == $store.user?.surname
    && editUser.email.value == $store.user?.email
    && editUser.role.value == $store.user?.role
    && editUser.password.value == ''
    && editUser.confirmPassword.value == ''
}
async function updateUser(): Promise<void> {
  if (isAuthUser.value && checkLoggedInUserDetailsUnchanged()) {
    notification('No user details were changed', 'error') 
    return
  }
  await passValidation(v$.value.editUser).then(async () => {
    $q.loading.show()
    await api.put(`v1/api/users/${user.value?._id}`, {
      name: editUser.name.value,
      surname: editUser.surname.value,
      email: editUser.email.value,
      role: editUser.role.value,
      password: editUser.password.value,
      confirmPassword: editUser.confirmPassword.value
    }).then(
      response => {
        $q.loading.hide()
        user.value = response.data.user
        toggleEditing()
        if (isAuthUser.value) {
          notification('User details were updated successfuly. Please login to your account with your updated details', 'success') 
          logOut()
        } else notification('User details were updated successfuly', 'success') 
      },
      error => {
        $q.loading.hide()
        let errorMessage = null
        if (error.response) {
          errorMessage = error.response.data.message
        } else if (error.request) {
          errorMessage = error.request
        } else {
          errorMessage = error.message
        }
        notification(errorMessage, 'error')
      }
    )
  })
}
async function getUser(): Promise<void> {
  $q.loading.show()
  await api.get(`v1/api/users/${$route.query.id}`).then(
    response => {
      $q.loading.hide()
      user.value = response.data.user
    },
    () => $q.loading.hide()
  )
}

onMounted(() => getUser())
</script>