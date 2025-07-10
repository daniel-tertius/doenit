<script>
  let items = [
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

<div class="bg-t-primary-600 rounded-lg text-t-secondary">
  <div class="p-4">
    <h3 class="font-semibold mb-2">Toekomende Idees</h3>
    <ul class="space-y-4 text-sm">
      {#each items as { title, description }}
        <li class="space-y-1">
          <div class="flex items-start leading-loose gap-2 font-medium">
            <span class="text-blue-500">•</span>
            <span>{title}</span>
          </div>
          <p class="text-t-secondary/60 ml-4">
            {description}
          </p>
        </li>
      {/each}
    </ul>
  </div>
</div>
