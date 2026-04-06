<script setup>
const route = useRoute();
const cycleId = route.params.id;
const cycleDateStr = new Date(cycleId).toISOString().replace('T', ' ').replace('.000Z', ' UTC');

const { data: invoicesData, status: rStatus } = await useFetch(`/api/cycles/${cycleId}/invoices`);
const { data: payoutsData, status: pStatus } = await useFetch(`/api/cycles/${cycleId}/payouts`);

const formatCent = (cents) => '$' + (cents / 100).toFixed(2);

const activeTab = ref('invoices'); // 'invoices' or 'payouts'
</script>

<template>
  <div>
    <div style="margin-bottom: 2rem;">
      <NuxtLink to="/" style="color: var(--text-muted); text-decoration: none; font-size: 0.875rem;">&larr; Return to Central Dashboard</NuxtLink>
      <h2 style="margin-top: 1rem; font-size: 2rem;">Cycle Settlement Overview</h2>
      <p style="font-family: monospace; color: var(--primary); font-size: 1.1rem;">Period Initiated: {{ cycleDateStr }}</p>
    </div>

    <div class="tabs">
      <div 
        class="tab" 
        :class="{ active: activeTab === 'invoices' }" 
        @click="activeTab = 'invoices'"
      >
        Restaurant Invoices
      </div>
      <div 
        class="tab" 
        :class="{ active: activeTab === 'payouts' }" 
        @click="activeTab = 'payouts'"
      >
        Creator Summaries
      </div>
    </div>

    <!-- INVOICES TAB -->
    <div v-if="activeTab === 'invoices'">
      <div v-if="rStatus === 'pending'" style="display: flex; align-items: center; gap: 0.75rem; color: var(--text-muted); padding: 2rem;">
        <div class="spinner"></div>
        Compiling invoice generation...
      </div>
      <div v-else-if="!invoicesData?.invoices?.length" style="color: var(--warning); padding: 2rem;">No active restaurant invoices found for this cycle window.</div>
      <div v-else style="display: flex; flex-direction: column; gap: 2rem;">
        <div v-for="inv in invoicesData.invoices" :key="inv.restaurantId" class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border); padding-bottom: 1.5rem;">
            <div>
              <p style="margin: 0; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted);">Invoice For</p>
              <h3 style="margin: 0; font-size: 1.5rem;">Restaurant ID: {{ inv.restaurantId }}</h3>
            </div>
            <div style="text-align: right; background: rgba(0,0,0,0.2); padding: 1rem 1.5rem; border-radius: 8px;">
              <div style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 0.25rem;">Total Receivable Due</div>
              <div class="currency" style="font-size: 1.75rem; color: var(--text-main); font-weight: 700;">
                {{ formatCent(inv.grandTotal) }}
              </div>
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem;">
             <div style="background: rgba(255,255,255,0.02); padding: 1rem; border-radius: 8px; border: 1px solid var(--border);">
              <div style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 0.5rem;">Cleared Creator Payout</div>
              <div class="currency" style="font-size: 1.25rem; font-weight: 600;">{{ formatCent(inv.totalCreatorPayments) }}</div>
            </div>
            <div style="background: rgba(255,255,255,0.02); padding: 1rem; border-radius: 8px; border: 1px solid var(--border);">
              <div style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 0.5rem;">URGOOD Service Fees</div>
              <div class="currency" style="font-size: 1.25rem; font-weight: 600;">{{ formatCent(inv.totalUrgoodFees) }}</div>
            </div>
            <div style="background: rgba(255,255,255,0.02); padding: 1rem; border-radius: 8px; border: 1px solid var(--border);">
              <div style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 0.5rem;">Stripe Transaction Taxes</div>
              <div class="currency" style="font-size: 1.25rem; font-weight: 600;">{{ formatCent(inv.totalStripeFees) }}</div>
            </div>
          </div>

          <h4 style="margin: 0 0 1rem 0; color: var(--text-muted); font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em;">Ledger Distribution Details</h4>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Creator ID</th>
                  <th>Covers</th>
                  <th>New Period Yield</th>
                  <th>Cleared Rollover</th>
                  <th>URGOOD Assessment</th>
                  <th>Settlement Disposition</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="det in inv.details" :key="det.creatorId">
                  <td><span style="font-weight: 600;">{{ det.creatorId }}</span></td>
                  <td>{{ det.covers }}</td>
                  <td class="currency">{{ formatCent(det.periodAmount) }}</td>
                  <td class="currency" :style="{ opacity: (det.payable && det.rolledOverAmount > 0) ? 1 : 0.5 }">
                    {{ (det.payable && det.rolledOverAmount > 0) ? formatCent(det.rolledOverAmount) : '—' }}
                  </td>
                  <td class="currency" style="color: var(--warning);">{{ formatCent(det.urgoodFees) }}</td>
                  <td>
                    <span v-if="det.payable" class="badge payable">Disbursed</span>
                    <span v-else class="badge rolled">Below $25 — Carried Forward</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- PAYOUTS TAB -->
    <div v-if="activeTab === 'payouts'">
      <div v-if="pStatus === 'pending'" style="display: flex; align-items: center; gap: 0.75rem; color: var(--text-muted); padding: 2rem;">
        <div class="spinner"></div>
        Compiling creator statements...
      </div>
      <div v-else-if="!payoutsData?.creatorPayouts?.length" style="color: var(--warning); padding: 2rem;">No creator payout data available.</div>
      <div v-else style="display: flex; flex-direction: column; gap: 2rem;">
        <div v-for="sum in payoutsData.creatorPayouts" :key="sum.creatorId" class="card">
           <div style="display: flex; justify-content: space-between; align-items: stretch; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border); padding-bottom: 1.5rem;">
            <div style="display: flex; flex-direction: column; justify-content: center;">
              <p style="margin: 0; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted);">Creator Settlement For</p>
              <h3 style="margin: 0; font-size: 1.5rem;">ID: {{ sum.creatorId }}</h3>
            </div>
            <div style="display: flex; gap: 1rem;">
               <div style="background: var(--warning-bg); border: 1px solid rgba(245, 158, 11, 0.2); padding: 1rem 1.5rem; border-radius: 8px; text-align: right; min-width: 150px;">
                <div style="font-size: 0.875rem; color: var(--warning); margin-bottom: 0.25rem;">Rolled Over</div>
                <div class="currency" style="font-size: 1.5rem; font-weight: 700; color: var(--warning);">
                  {{ formatCent(sum.totalRolledOverAmount) }}
                </div>
              </div>
              <div style="background: var(--success-bg); border: 1px solid rgba(16, 185, 129, 0.2); padding: 1rem 1.5rem; border-radius: 8px; text-align: right; min-width: 150px;">
                <div style="font-size: 0.875rem; color: var(--success); margin-bottom: 0.25rem;">Net Disbursed</div>
                <div class="currency" style="font-size: 1.5rem; font-weight: 700; color: var(--success);">
                  {{ formatCent(sum.totalPayableAmount) }}
                </div>
              </div>
            </div>
          </div>

          <h4 style="margin: 0 0 1rem 0; color: var(--text-muted); font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em;">Restaurant Payout Sources</h4>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Restaurant Venue</th>
                  <th>This Period's Yield</th>
                  <th>Forward Balance (inc. Rollover)</th>
                  <th>Threshold (&gt; $25.00) Evaluated</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="det in sum.details" :key="det.restaurantId">
                  <td><span style="font-weight: 600;">{{ det.restaurantId }}</span></td>
                  <td class="currency">{{ formatCent(det.periodAmount) }}</td>
                  <td class="currency" style="color: var(--primary);">{{ formatCent(det.totalAmount) }}</td>
                  <td>
                    <span v-if="det.payable" style="color: var(--success); display: inline-flex; align-items: center; gap: 0.25rem;">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      Verified (Disbursed)
                    </span>
                    <span v-else style="color: var(--warning); display: inline-flex; align-items: center; gap: 0.25rem;">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 8 12 12 14 14"></polyline></svg>
                      Pending Carryforward
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
