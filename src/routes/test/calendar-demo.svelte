<script>
  import { Calendar } from "$lib/components/element/calendar";

  let startDate = $state(null);
  let endDate = $state(null);

  function handleDateSelected({ start_date, end_date }) {
    console.log("Date selected:", { start_date, end_date });
    startDate = start_date;
    endDate = end_date;
  }

  function clearSelection() {
    startDate = null;
    endDate = null;
  }
</script>

<div class="demo-container">
  <h1>Calendar Component Demo</h1>
  
  <div class="calendar-wrapper">
    <Calendar
      bind:startDate
      bind:endDate
      locale="af-ZA"
      weekStartsOn={1}
      ondateselected={handleDateSelected}
    />
  </div>

  <div class="selection-info">
    <h2>Selected Dates:</h2>
    <p>
      <strong>Start:</strong> 
      {startDate ? startDate.toLocaleDateString() : 'None'}
    </p>
    <p>
      <strong>End:</strong> 
      {endDate ? endDate.toLocaleDateString() : 'None'}
    </p>
    
    <button class="clear-btn" onclick={clearSelection}>
      Clear Selection
    </button>
  </div>
</div>

<style>
  .demo-container {
    max-width: 500px;
    margin: 2rem auto;
    padding: 1rem;
  }

  h1 {
    font-size: var(--font-size-2xl);
    margin-bottom: 1.5rem;
    text-align: center;
  }

  .calendar-wrapper {
    margin-bottom: 2rem;
  }

  .selection-info {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    padding: 1rem;
  }

  .selection-info h2 {
    font-size: var(--font-size-lg);
    margin-bottom: 0.75rem;
  }

  .selection-info p {
    margin: 0.5rem 0;
  }

  .clear-btn {
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
    font-size: var(--font-size-sm);
    transition: background 0.15s ease;
  }

  .clear-btn:hover {
    background: #1d4ed8;
  }
</style>
