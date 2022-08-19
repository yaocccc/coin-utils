<template>
    <n-message-provider>
        <content />
        <n-layout embedded content-style="padding: 24px;">
            <n-card class="main">
                <Appbar />
                <n-tabs type="line" animated class="main_tabline">
                    <n-tab-pane name="presale" tab="Presale">
                        <Presale />
                    </n-tab-pane>
                    <n-tab-pane name="query" tab="Query">
                        <Query />
                    </n-tab-pane>
                </n-tabs>
            </n-card>
        </n-layout>
    </n-message-provider>
</template>

<script setup lang="ts">
import { defineComponent } from 'vue';
import Appbar from './components/Appbar.vue';
import Query from './components/Query.vue';
import Presale from './components/Presale.vue';
defineComponent({
    components: {
        Appbar,
        Query,
        Presale,
    },
});
</script>

<style>
.main {
    padding-left: 20px;
}
.n-tab-pane {
    margin-top: 20px;
}
</style>
