<template>
  <q-page class="q-pa-md">
    <q-card  flat bordered class="no-shadow">
      <q-card-section class="flex justify-between items-center">
        <div class="text-h6 text-light text-primary">
          Users {{ users.length }}
        </div>
      </q-card-section>
      <q-card-section class="flex justify-between items-center">
        <q-input stack-label v-model="email" placeholder="Email" />
        <q-input stack-label v-model="name" placeholder="Name" />
        <q-input stack-label v-model="surname" placeholder="Surname" />
        <q-btn round dense flat icon="search" @click="getUsers()" />
      </q-card-section>
    </q-card>
    <q-markup-table separator="horizontal" flat bordered>
      <thead class="bg-primary">
        <tr class="text-white text-bold">
          <th class="text-left"></th>
          <th class="text-left">Name</th>
          <th class="text-left">Surname</th>
          <th class="text-left">Email</th>
          <th class="text-left">Role</th>
          <th class="text-left">Joined</th>
          <th class="text-right" width="30px">View</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(user, index) in users" :key="index">
          <td class="text-left"><q-icon size="sm" color="primary" name="account_circle"/></td>
          <td class="text-left">{{ user.name || "-" }}</td>
          <td class="text-left">{{ user.surname || "-" }}</td>
          <td class="text-left">{{ user.email || "-" }}</td>
          <td class="text-left">{{ user.role || "-" }}</td>
          <td class="text-left">{{ user.created ? moment(user.created).format('YYYY-MM-DD') : "-" }}</td>
          <th class="text-right" width="30px"> 
            <q-icon @click="vuewUserProfile(user)" size="sm" color="secondary" name="visibility" />
          </th>
        </tr>
      </tbody>
    </q-markup-table>
    <q-card v-if="users.length <= 0" flat bordered class="no-shadow">
      <q-card-section class="text-center">
        <h4 class="text-primary">No records found</h4>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'
import User from 'src/models/User'
import moment from 'moment'
import { router } from 'src/router'
import { useStore } from 'src/stores/mainStore'

const users= ref<Array<User>>([])
const name = ref<string>('')
const surname = ref<string>('')
const email = ref<string>('')

const $q = useQuasar()
const $store = useStore()

function vuewUserProfile(user: User): void {
  router.push({path: '/user', query: { id: user._id}})
}
async function getUsers(): Promise<void> {
  $q.loading.show()
  await api.get('v1/api/users', {params: { 
    name: name.value, 
    surname: surname.value, 
    email: email.value,
    _id: $store.user?._id
  }}).then(
    response => {
      $q.loading.hide()
      users.value = response.data.users
    },
    () => $q.loading.hide()
  )
}

onMounted(() => getUsers())
</script>