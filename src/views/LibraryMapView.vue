<template>
  <div class="min-h-screen bg-white p-6">
    <h1 class="text-3xl font-bold text-gray-800 mb-4">Personas dentro de la Biblioteca</h1>
    <div class="w-full h-[600px]">
      <LibraryMap />
    </div>
  </div>
</template>

<script>
import LibraryMap from '@/components/maps/LibraryMap.vue'

export default {
  components: { LibraryMap }
}
</script>