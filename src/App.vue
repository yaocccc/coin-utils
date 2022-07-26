<template>
    <Query />
</template>

<script setup lang="ts">
import { defineComponent } from 'vue';
import Query from './components/Query.vue';
defineComponent({
    components: {
        Query,
    },
});
</script>
