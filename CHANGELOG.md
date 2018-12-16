# Change Log

## [2.1.0]
* support track duration
* HTML5 audio support


## [2.0.0]

* fixed problems with old browsers
* dependencies upgrade
* support for multiple players in one site
    * can define multiple payers by "playerId"
    * default "playerId" is set to "srr-player"
    

   Before:

   ```html
   <div id="srr-player"></div>

    <script src="../dist/player.js"></script>
    <script>
        new srrPlayer.Player([
            {
                name: 'Čaj',
            },
            {
                name: 'Dolce vita',
                src: './assets/mp3/dolce_vita.mp3'
            }
        ]);
    </script>
   ```

   After:

   ```html
    <div class="srr-player" id="srr-player"></div>
  
 
    <script src="../dist/player.js"></script>
    <script>
        new srrPlayer.Player({
            "playerId": "srr-player",
            "items": [
                {
                    name: 'Čaj',
                },
                {
                    name: 'Dolce vita',
                    src: './assets/mp3/dolce_vita.mp3'
                }
            ]
        });
    </script>
   ```
   