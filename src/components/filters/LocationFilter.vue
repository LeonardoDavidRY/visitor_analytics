<template>
  <div>
    <label for="location" class="block text-sm font-medium text-gray-700"
      >Ubicación</label
    >
    <select
      id="location"
      v-model="selected"
      @change="$emit('update:location', selected)"
      class="mt-1 block w-full border border-gray-300 rounded-md"
    >
      <option value="">Todas</option>
      <option v-for="loc in locations" :key="loc" :value="loc">
        {{ loc }}
      </option>
    </select>
  </div>
</template>

<script>
export default {
  name: 'LocationFilter',
  props: {
    locations: Array,
  },
  data() {
    return {
      selected: '',
    };
  },
};
</script>
