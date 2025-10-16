# Calendar Component

A lightweight, efficient, and feature-rich calendar component for Svelte 5 with date range selection support.

## Features

✅ **Full month view** with grid layout  
✅ **Previous/Next month navigation**  
✅ **Date range selection** (start and end dates)  
✅ **Single date selection** (optional - just don't select end date)  
✅ **Highlight today's date**  
✅ **Locale-aware** formatting for days and months  
✅ **Visual highlighting** for selected dates and ranges  
✅ **Configurable week start** (Sunday or Monday)  
✅ **Month and year pickers** for quick navigation  
✅ **"Today" button** to jump to current date  
✅ **Smooth transitions** and animations  
✅ **Responsive design**  
✅ **Event emission** on date selection  
✅ **Shows previous/next month days** (greyed out)

## Usage

### Basic Example

```svelte
<script>
  import { Calendar } from "$lib/components/element/calendar";

  let startDate = $state(null);
  let endDate = $state(null);

  function handleDateSelected({ start_date, end_date }) {
    console.log("Selected:", { start_date, end_date });
  }
</script>

<Calendar
  bind:startDate
  bind:endDate
  ondateselected={handleDateSelected}
/>
```

### With Custom Configuration

```svelte
<Calendar
  bind:startDate
  bind:endDate
  locale="en-US"
  weekStartsOn={1}
  ondateselected={handleDateSelected}
/>
```

### Different Locales

```svelte
<!-- US English, week starts on Sunday -->
<Calendar locale="en-US" weekStartsOn={0} />

<!-- UK English, week starts on Monday -->
<Calendar locale="en-GB" weekStartsOn={1} />

<!-- German -->
<Calendar locale="de-DE" weekStartsOn={1} />

<!-- Afrikaans -->
<Calendar locale="af-ZA" weekStartsOn={1} />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `startDate` | `Date \| null` | `null` | The selected start date (bindable) |
| `endDate` | `Date \| null` | `null` | The selected end date (bindable) |
| `locale` | `string` | `"en-US"` | Locale for date/month names (BCP 47 language tag) |
| `weekStartsOn` | `number` | `1` | Day week starts on: `0` = Sunday, `1` = Monday |
| `ondateselected` | `function` | `null` | Callback fired when dates are selected |

## Events

### `ondateselected`

Fired when a date is selected or when a date range is completed/modified.

**Payload:**
```javascript
{
  start_date: Date | null,  // The start date of selection
  end_date: Date | null      // The end date of selection (null if only start selected)
}
```

## Date Selection Behavior

1. **First click**: Sets the start date, clears end date
2. **Second click**: 
   - If before start date → swaps to make it the new start, old start becomes end
   - If same as start date → keeps only start date, clears end date
   - If after start date → sets as end date
3. **Third click**: Starts new selection (clears previous range)

This allows users to:
- Select a single date (just click once)
- Select a date range (click start, then end)
- Reverse their selection if they click in wrong order

## Styling

The component uses CSS custom properties from your global styles:
- `--font-size-xs`, `--font-size-sm`, `--font-size-base` for text sizing
- Tailwind-compatible color scheme with blue (`#2563eb`) as the primary color

### Customization

You can override styles by targeting these classes:

```css
/* Calendar container */
.calendar { }

/* Day cells */
.calendar-day { }
.calendar-day.today { }
.calendar-day.selected { }
.calendar-day.in-range { }
.calendar-day.other-month { }

/* Navigation */
.nav-button { }
.today-button { }
```

## Performance

The component is optimized for performance:
- Uses Svelte 5's `$derived` for reactive computations
- Minimal re-renders with efficient date calculations
- Lightweight DOM structure
- No external dependencies (except Svelte)

## Components

The calendar is split into three components:

### `Calendar.svelte`
Main component with navigation, month/year pickers, and selection logic.

### `CalendarMonth.svelte`
Renders the month grid with day headers and day cells.

### `CalendarDay.svelte`
Individual day cell with styling for different states.

## Examples

### With Clear Button

```svelte
<script>
  import { Calendar } from "$lib/components/element/calendar";

  let startDate = $state(null);
  let endDate = $state(null);

  function clearSelection() {
    startDate = null;
    endDate = null;
  }
</script>

<Calendar bind:startDate bind:endDate />
<button onclick={clearSelection}>Clear</button>
```

### Pre-selected Range

```svelte
<script>
  import { Calendar } from "$lib/components/element/calendar";

  let startDate = $state(new Date(2025, 9, 1));  // Oct 1, 2025
  let endDate = $state(new Date(2025, 9, 15));   // Oct 15, 2025
</script>

<Calendar bind:startDate bind:endDate />
```

### Display Selected Range

```svelte
<script>
  import { Calendar } from "$lib/components/element/calendar";

  let startDate = $state(null);
  let endDate = $state(null);

  $effect(() => {
    if (startDate && endDate) {
      const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      console.log(`Range: ${days} days`);
    }
  });
</script>

<Calendar bind:startDate bind:endDate />

{#if startDate && endDate}
  <p>
    {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
  </p>
{/if}
```

## Browser Support

Works in all modern browsers that support:
- ES6+
- CSS Grid
- CSS Custom Properties
- Intl.DateTimeFormat (for locale support)

## License

Part of the Doenit project.
