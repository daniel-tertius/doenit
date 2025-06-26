<script>
  // List of new features - you can fetch this from an API or store
  let newFeatures = [
    {
      id: 6,
      title: "Beskrywing vir take",
      description: "Jy kan nou 'n beskrywing byvoeg vir jou take. Dit is diskreet weggesteek vir gebruikersgemak.",
      category: "Nuut",
    },
    {
      id: 7,
      title: "Spesifieke dae in die week",
      description: "Jy kan nou spesifieke dae in die week kies vir herhaalde take.",
      category: "Nuut",
    },
    {
      id: 2,
      title: "Tydsbepaling",
      description:
        "Tyd is bygevoeg vir beide begin- en sperdatums. Die gebruikerskoppelvlak is ook herontwerp vir groter gebruiksgemak.",
      category: "Nuut",
    },
    {
      id: 0,
      title: "Hierdie bladsy",
      description: "Hierdie bladsy is geskep om jou te wys wat nuut is in die toepassing.",
      category: "Nuut",
    },
    {
      id: 5,
      title: "Gestoorde kategorie-filtering",
      description:
        "As jy die filter op die tuisblad stel, bly dit behoue, selfs al maak jy die toepassing toe en weer oop.",
      category: "Nuut",
    },
    {
      id: 1,
      title: "Verbetering aan herhaalde take",
      description:
        "Voorheen is voltooide herhaalde take nie vertoon nie. Nou wys dit met 'n nommer om aan te dui hoe dikwels dit voltooi is.",
      category: "Verandering",
    },
    {
      id: 3,
      title: "Kopbalk van toepassing sigbaar",
      description: "Die kopbalk van die toepassing was weggesteek onder die foon se statusbalk. Dit is nou reggestel.",
      category: "Reggemaak",
    },
    {
      id: 4,
      title: "Tuis-ikoon op die 'Oor Doenit'-bladsy",
      description: "Die tuis-ikoon op die 'Oor Doenit'-bladsy was nie korrek nie. Dit is nou reggestel.",
      category: "Reggemaak",
    },
  ];
</script>

<header class="text-center mb-12">
  <h1 class="text-4xl font-bold text-white mb-2">Wat's nuut?</h1>
  <p class="text-tertiary text-lg">Die onlangste veranderinge aangebring</p>
</header>

<div class="flex flex-col gap-2">
  {#each newFeatures as feature (feature.id)}
    <div class="bg-primary-20l border border-primary-20d rounded-lg p-3">
      <div class="flex justify-between items-start mb-4 flex-wrap gap-2">
        <h2 class="text-xl text-tertiary-20l font-semibold">{feature.title}</h2>
        <span class="bg-blue-600 px-3 py-1 text-tertiary-20l rounded-full text-sm font-medium">
          {feature.category}
        </span>
      </div>
      <p class="leading-relaxed mb-4 text-tertiary">{feature.description}</p>
      <div class="flex justify-end">
        {#if feature.dateAdded}
          <time class="text-tertiary text-sm">
            {new Date(feature.dateAdded).toLocaleDateString()}
          </time>
        {/if}
      </div>
    </div>
  {/each}
</div>
