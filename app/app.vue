<template>
  <div class="app-container">
    <NuxtRouteAnnouncer />
    <header>
      <div>
        <h1 style="margin:0; font-size: 1.5rem; color: var(--primary);">URGOOD</h1>
        <p style="margin: 0.25rem 0 0 0; font-size: 0.875rem; color: var(--text-muted);">Reconciliation System Dashboard</p>
      </div>
      <div>
        <NuxtLink to="/" class="btn">Dashboard</NuxtLink>
      </div>
    </header>
    <main>
      <NuxtPage />
    </main>
  </div>
</template>
