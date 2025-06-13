<template>
  <div>
    <label for="timeRange" class="block text-sm font-medium text-gray-700"
      >Rango de Hora</label
    >
    <input
      type="range"
      id="timeRange"
      :min="min"
      :max="max"
      v-model="value"
      @input="$emit('update:time', value)"
      class="w-full"
    />
    <p class="text-sm mt-2">Hora seleccionada: {{ value }}:00</p>
  </div>
</template>

<script>
export default {
  name: 'TimeSlider',
  props: {
    min: {
      type: Number,
      default: 0,
    },
    max: {
      type: Number,
      default: 23,
    },
  },
  data() {
    return {
      value: 12,
    };
  },
};
</script>
