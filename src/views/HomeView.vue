<template>
  <div class="home">
    <HelloWorld msg="Proyecto de Análisis de Visitantes" />
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue';

export default {
  name: 'HomeView',
  components: {
    HelloWorld,
  },
};
</script>