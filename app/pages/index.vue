<script setup>
const { data, status, refresh } = await useFetch('/api/cycles');

const isSeeding = ref(false);

const seedDatabase = async () => {
  if (isSeeding.value) return;
  isSeeding.value = true;
  try {
    const res = await $fetch('/api/admin/seed', { method: 'POST' });
    if (res.success) {
      alert(`Database Seeded Successfully! Processed ${res.recordsProcessed} CSV records and produced ${res.payoutStatesCreated} ledger entries.`);
      await refresh();
    }
  } catch (e) {
    alert('Error seeding database: ' + (e.data?.message || e.message));
  } finally {
    isSeeding.value = false;
  }
};

const formatDate = (d) => new Date(d).toISOString().split('T')[0] + ' ' + new Date(d).toISOString().split('T')[1].slice(0, 5) + ' UTC';
</script>

<template>
  <div>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
      <h2>Settlement Cycles Overview</h2>
      <button @click="seedDatabase" :disabled="isSeeding">
        {{ isSeeding ? 'Processing CSV...' : 'Parse External CSV & Seed Engine' }}
      </button>
    </div>

    <div v-if="status === 'pending'">Loading cycles...</div>
    <div v-else-if="!data?.cycles?.length">
      <div class="card" style="text-align: center; padding: 4rem;">
        <p style="font-size: 1.1rem; margin-bottom: 1rem;">No cycle ledgers established.</p>
        <button @click="seedDatabase" :disabled="isSeeding">
          {{ isSeeding ? 'Processing...' : 'Execute Initial CSV Ingestion' }}
        </button>
      </div>
    </div>
    
    <div v-else style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem;">
      <NuxtLink 
        v-for="cycle in data.cycles" 
        :key="cycle.cycleStartDate"
        :to="`/cycles/${encodeURIComponent(cycle.cycleStartDate)}`"
        class="card interactive"
        style="text-decoration: none; color: inherit; display: block;"
      >
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
          <h3 style="font-size: 1.1rem; margin: 0;">Cycle Ledger</h3>
          <span class="badge" style="background: rgba(255,255,255,0.05); color: var(--text-muted);">Reconciled</span>
        </div>
        
        <div style="margin-bottom: 1.5rem;">
          <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 0.25rem;">Commences (UTC)</div>
          <div style="font-family: monospace; font-size: 0.95rem; color: var(--text-main);">
            {{ formatDate(cycle.cycleStartDate) }}
          </div>
        </div>
        
        <div style="border-top: 1px solid var(--border); padding-top: 1rem; text-align: right;">
          <span style="font-size: 0.875rem; color: var(--primary); font-weight: 500;">Inspect Settlements &rarr;</span>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
