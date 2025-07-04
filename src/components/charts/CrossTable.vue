<template>
  <div class="overflow-x-auto">
    <table class="min-w-full bg-white border border-gray-200 rounded-lg">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">
            Rango de Edad
          </th>
          <th 
            v-for="userType in userTypes" 
            :key="userType"
            class="px-4 py-2 text-center text-sm font-medium text-gray-700 border-b"
          >
            {{ userType }}
          </th>
          <th class="px-4 py-2 text-center text-sm font-medium text-gray-700 border-b bg-blue-50">
            Total
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(ageGroup, index) in ageGroups" :key="ageGroup" 
            :class="index % 2 === 0 ? 'bg-white' : 'bg-gray-50'">
          <td class="px-4 py-2 text-sm font-medium text-gray-900 border-b">
            {{ ageGroup }}
          </td>
          <td 
            v-for="userType in userTypes" 
            :key="userType"
            class="px-4 py-2 text-center text-sm text-gray-700 border-b"
          >
            {{ getValue(ageGroup, userType) }}
          </td>
          <td class="px-4 py-2 text-center text-sm font-medium text-gray-900 border-b bg-blue-50">
            {{ getRowTotal(ageGroup) }}
          </td>
        </tr>
        <!-- Fila de totales -->
        <tr class="bg-blue-50 font-medium">
          <td class="px-4 py-2 text-sm text-gray-900 border-t">
            Total
          </td>
          <td 
            v-for="userType in userTypes" 
            :key="userType"
            class="px-4 py-2 text-center text-sm text-gray-900 border-t"
          >
            {{ getColumnTotal(userType) }}
          </td>
          <td class="px-4 py-2 text-center text-sm font-bold text-gray-900 border-t">
            {{ grandTotal }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  }
});

const ageGroups = computed(() => Object.keys(props.data || {}));

const userTypes = computed(() => {
  const types = new Set();
  ageGroups.value.forEach(ageGroup => {
    if (props.data[ageGroup]) {
      Object.keys(props.data[ageGroup]).forEach(type => {
        types.add(type);
      });
    }
  });
  return Array.from(types).sort();
});

const getValue = (ageGroup, userType) => {
  return props.data?.[ageGroup]?.[userType] || 0;
};

const getRowTotal = (ageGroup) => {
  if (!props.data[ageGroup]) return 0;
  return Object.values(props.data[ageGroup]).reduce((sum, val) => sum + (val || 0), 0);
};

const getColumnTotal = (userType) => {
  return ageGroups.value.reduce((sum, ageGroup) => {
    return sum + getValue(ageGroup, userType);
  }, 0);
};

const grandTotal = computed(() => {
  return ageGroups.value.reduce((sum, ageGroup) => {
    return sum + getRowTotal(ageGroup);
  }, 0);
});
</script>
