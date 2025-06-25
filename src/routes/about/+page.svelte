<script>
  let items = [
    {
      title: "Rugsteun",
      description:
        "Doenit werk tans 100% vanlyn, wat beteken jou data word op jou toestel gestoor. As jy die toepassing verwyder, gaan jou data verlore. Ek werk aan 'n rugsteunfunksie om jou data veilig te hou, sodat jy nooit jou take verloor nie.",
    },
    {
      title: "Kennisgewings",
      description:
        "Stel self wanneer Doenit jou moet herinner aan daardie dag se take. Met hierdie funksie bly jy op koers, sonder om iets te vergeet.",
    },
    {
      title: "Engels Ondersteuning",
      description:
        "Doenit is trots Afrikaans, maar ek voeg binnekort die opsie by om na Engels oor te skakel vir 'n breër gebruikerservaring.",
    },
    {
      title: "Vriende-sinkronisasie",
      description:
        "Deel take met vriende of wys spesifieke take aan iemand toe. Werk saam aan een taak of hou mekaar gemotiveerd met gedeelde verantwoordelikhede.",
    },
    {
      title: "Widget",
      description:
        "Voeg 'n widget by jou tuisskerm om vinnig toegang te hê tot jou take sonder om die toepassing oop te maak. Hou jou take in sig en bestuur dit maklik.",
    },
  ];
</script>

<div class="max-w-md mx-auto mt-8 text-tertiary">
  <div class="mt-4 text-center">
    <h1 class="text-3xl font-bold mb-4">Kontak My</h1>
    <p class="text-lg mb-2">
      As jy enige vrae of voorstelle het, kontak my gerus by <a
        href="mailto:support.tricky800@passmail.com"
        class="text-blue-500 hover:text-blue-700 underline"
      >
        support.tricky800@passmail.com
      </a>
    </p>
  </div>

  <div class="mt-4 text-center">
    <h1 class="text-3xl font-bold mb-4">Toekomstige Idees</h1>
    <ul class="space-y-1">
      {#each items as { title, description }}
        <li class="flex flex-col justify-start items-center p-2 border border-tertiary-20d rounded">
          <span class="w-full text-lg">{title}</span>
          <span class="text-tertiary-20d text-sm">{description}</span>
        </li>
      {/each}
    </ul>
  </div>

  <div class="mt-4 text-center">
    <p class="text-tertiary-20d">
      As jy enige ander idees of terugvoer het, stuur dit gerus na <a
        href="mailto:support.tricky800@passmail.com"
        class="text-blue-500 hover:text-blue-700 underline"
      >
        support.tricky800@passmail.com
      </a>.
    </p>
  </div>
</div>
