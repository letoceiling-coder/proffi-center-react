import { ref, reactive } from 'vue'
import { useRooms } from '../composables/useRooms'
import { useClients } from '../composables/useClients'
import { useSmeta } from '../composables/useSmeta'

export function useAppStore() {
  // State
  const activeSection = ref('main-1')
  const ceilingId = ref(null)
  const ceilingOne = ref(true)
  const ceilingAll = ref(false)
  const smataClient = ref(true)
  const smataMontaj = ref(false)
  const smataMaterial = ref(false)
  const smataWorks = ref(true)
  const smataMaterials = ref(false)
  
  // Rooms composable
  const { getRooms, rooms } = useRooms()
  
  // Clients composable
  const { 
    newClient, 
    userClient, 
    userClientAdress,
    getStorageReturn,
    clearElems 
  } = useClients()
  
  // Smeta composable
  const { exitInSmeta, exitInSmetaAll, listGroop, listGroopRedactor } = useSmeta()

  const setCeilingOne = (value) => {
    ceilingOne.value = value
    ceilingAll.value = !value
    if (value) {
      exitInSmeta(ceilingId.value)
    } else {
      exitInSmetaAll()
    }
  }

  const setSmataClient = (value) => {
    smataClient.value = value
    smataMontaj.value = false
    smataMaterial.value = false
    exitInSmeta(ceilingId.value)
  }

  const setSmataMontaj = (value) => {
    smataClient.value = false
    smataMontaj.value = value
    smataMaterial.value = false
    exitInSmeta(ceilingId.value)
  }

  const setSmataMaterial = (value) => {
    smataClient.value = false
    smataMontaj.value = false
    smataMaterial.value = value
    exitInSmeta(ceilingId.value)
  }

  const setSmataWorks = (value) => {
    smataWorks.value = value
    smataMaterials.value = !value
    listGroop(value ? 0 : 1)
  }

  return {
    // State
    activeSection,
    ceilingId,
    ceilingOne,
    ceilingAll,
    smataClient,
    smataMontaj,
    smataMaterial,
    smataWorks,
    smataMaterials,
    rooms,
    newClient,
    userClient,
    userClientAdress,
    
    // Methods
    getRooms,
    getStorageReturn,
    clearElems,
    setCeilingOne,
    setSmataClient,
    setSmataMontaj,
    setSmataMaterial,
    setSmataWorks,
    exitInSmeta,
    exitInSmetaAll,
    listGroop,
    listGroopRedactor
  }
}

