import { Howl } from 'howler';
import Playlist from './playlist';

/**
 * Player
 */
export class Player {

    /**
     * Constructor
     *
     * @param config {Object}
     */
    constructor(config) {

        /**
         * Playlist
         *
         * @type {Playlist}
         * @private
         */
        this._playlist = new Playlist(config.items);

        /**
         * @type {string}
         * @private
         */
        this._playerId = config.playerId || 'srr-player';

        /**
         * Play element
         *
         * @type {Element}
         * @private
         */
        this._playEl = null;

        /**
         * Progress element
         *
         * @type {Element}
         * @private
         */
        this._progressEl = null;

        /**
         * Duration element
         *
         * @type {Element}
         * @private
         */
        this._durationEl = null;

        /**
         *
         * @type {null|Number}
         * @private
         */
        this.loadingId = null;

        /**
         * Title element
         *
         * @type {Element}
         * @private
         */
        this._titleEl = null;

        if (this._playlist.getCurrentTrack()) {
            this._renderPlayer();
            this._initEvents();
        } else {
            this._renderPlaylist();
        }
    }

    /**
     * Render player
     *
     * @private
     */
    _renderPlayer() {
        let container = document.getElementById(this._playerId);

        container.innerHTML = `
            <div class="audio-player">
                <p class="track-title">${this._playlist.getCurrentTrack().getName()}</p>
                
                <div class="time-line">
                    <div class="progress-bar">
                        <div class="progress"></div>
                    </div>
                    
                    <p class="duration">00:00</p>
                </div>
                
                <div class="control-button control-rewind"></div>
                <div class="control-button control-play"></div>
                <div class="control-button control-forward"></div>
            </div>
            
            <table class="track-list">
                <tbody>
                    ${this._playlist.getTracks().map(track =>
                        `<tr class="${track.getSrc() ? 'playable' : ''}">
                            <td class="control-button ${track.getSrc() ? 'control-play' : ''}"></td>
                            <td></td>
                            <td>${track.getId() +1}. ${track.getName()}</td>
                        </tr>`
                    ).join('')}
                </tbody>
            </table>`;


        this._playEl     = document.querySelector(`#${this._playerId} .audio-player .control-button.control-play`);
        this._progressEl = document.querySelector(`#${this._playerId} .audio-player .time-line .progress-bar .progress`);
        this._durationEl = document.querySelector(`#${this._playerId} .audio-player .time-line .duration`);
        this._titleEl    = document.querySelector(`#${this._playerId} .audio-player .track-title`);
    }

    /**
     * Render playlist
     *
     * @private
     */
    _renderPlaylist() {
        let container = document.getElementById(this._playerId);

        container.innerHTML = `
            <ol>
                ${this._playlist.getTracks().map(track =>
                    `<li>${track.getName()}</li>`
                ).join('')}
            </ol>
        `;
    }

    /**
     * Init events
     *
     * @private
     */
    _initEvents() {
        let self = this;

        // toggle track
        this._playEl.addEventListener('click', () => self._toggleTrack());

        // rewind
        document
            .querySelector(`#${this._playerId} .audio-player .control-button.control-rewind`)
            .addEventListener('click', () => self._skip('prev'));

        // forward
        document
            .querySelector(`#${this._playerId} .audio-player .control-button.control-forward`)
            .addEventListener('click', () => self._skip('next'));

        // progress
        document
            .querySelector(`#${this._playerId} .audio-player .time-line .progress-bar`)
            .addEventListener('click', function (event) {
                self._seek((event.offsetX /this.clientWidth));
            });

        // track list
        document.querySelectorAll(`#${this._playerId} .track-list .playable`).forEach(function (track) {
            let Track = self._playlist.getTrack(track.rowIndex);

            if (Track) {
                Track.setPlayEl(track.children[0]);
            }

            track.addEventListener('click', function () {
                self._toggleTrack(track.rowIndex);
            });
        });
    }

    /**
     * Toggle track
     *
     * @param {Number} [id] Id of toggle track
     * @private
     */
    _toggleTrack(id) {
        let track   = this._playlist.getTrack(id),
            current = this._playlist.getCurrentTrack();

        if (track.hasSound() && track.getId() === current.getId()) {
            track.isPlaying() ? track.pause() : track.play();

            this._updatePlayer(track);
        } else {
            this._skipTo(track, true);
        }
    }

    /**
     * Skip in direction
     *
     * @param direction {String}
     * @param [autoPlay] {Boolean}
     * @private
     */
    _skip(direction, autoPlay) {
        autoPlay = (typeof autoPlay === 'boolean') ? autoPlay : false;

        let track = ('prev' === direction)
            ? this._playlist.getPrevTrack()
            : this._playlist.getNextTrack();

        if (autoPlay && track.getId() <= this._playlist.getCurrentTrack().getId()) {
            autoPlay = false;
        }

        this._skipTo(track, autoPlay);
    }

    /**
     * Skip to track
     *
     * @param track {Track}
     * @param [autoPlay] {Boolean}
     * @private
     */
    _skipTo(track, autoPlay) {
        autoPlay = (typeof autoPlay === 'boolean') ? autoPlay : false;

        let currentTrack = this._playlist.getCurrentTrack(),
            autoPlaying  = false;

        if (currentTrack.hasSound()) {
            autoPlaying = currentTrack.isPlaying();
            currentTrack.stop();
        }

        if (autoPlay || autoPlaying) {
            this._play(track);
        }

        this._updatePlayer(track);
        this._playlist.setCurrentTrack(track);
    }

    /**
     * Play track
     *
     * @param track {Track}
     * @private
     */
    _play(track) {
        if (!track.hasSound()) {
            let self = this;

            track.setSound(new Howl({
                src    : track.getSrc(),
                html5  : false,
                preload: false,

                onload: function() {
                    if (track.isPlaying()) {
                        track.play();
                    }
                },

                onplay: function() {
                    // Start updating the progress of the track
                    requestAnimationFrame(self._step.bind(self));
                },

                onend: function() {
                    track.setPlaying(false);
                    self._skip('next', true);
                },

                onloaderror: function() {
                    track.stop();
                    self._updatePlayer(track);
                },

                onplayerror: function() {
                    track.stop();
                    self._updatePlayer(track);
                },
            }));
        }

        track.play();
    }

    /**
     * Seek
     *
     * @param percent {Number}
     * @private
     */
    _seek(percent) {
        let track = this._playlist.getCurrentTrack();

        if (track.hasSound() && track.isPlaying()) {
            track.seek(track.getDuration() * percent);
        }
    }

    /**
     * Update animation step
     *
     * @private
     */
    _step() {
        let track = this._playlist.getCurrentTrack();

        if (track.hasSound() && !track.isLoading()) {
            this._progressEl.style.width = (((track.getSeek() / track.getDuration()) * 100) || 0) + '%';
            this._durationEl.innerHTML = track.getSeek(true);

            if (track.isPlaying()) {
                requestAnimationFrame(this._step.bind(this));
            }
        }
    }

    /**
     * Update player
     *
     * @param track {Track}
     * @private
     */
    _updatePlayer(track) {
        let self    = this,
            current = this._playlist.getCurrentTrack();

        let loading = function () {
            if (track.isLoading() && !self.loadingId) {
                let i = 0;

                self.loadingId = setInterval(function () {
                    i = ++i % 8;

                    self._durationEl.innerHTML = new Array(i+1).join(".");

                    if (!track.isLoading()) {
                        clearInterval(self.loadingId);
                        self.loadingId = null;
                        self._durationEl.innerHTML = '00:00';
                    }
                }, 500);
            }
        };

        if (track.getId() !== current.getId()) {
            if (this.loadingId) {
                clearInterval(this.loadingId);
                this.loadingId = null;
            }

            this._titleEl.innerHTML = track.getName();
            this._progressEl.style.width = '0%';
            this._durationEl.innerHTML = '00:00';
        }

        loading();

        this._playEl.className = track.isPlaying()
            ? 'control-button control-play playing'
            : 'control-button control-play';
    }
}
