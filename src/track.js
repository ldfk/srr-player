/**
 * Track
 */
export default class Track {

    /**
     * Constructor
     *
     * @param id {Number}
     * @param item {Object}
     * @param aq {String}
     */
    constructor(id, item, aq) {

        /**
         * Track id
         *
         * @type {Number}
         * @private
         */
        this._id = id;

        /**
         * Event tracking
         *
         * @type {String}
         * @private
         */
        this._aq = aq;

        /**
         * Track name
         *
         * @type {String}
         * @private
         */
        this._name = item.name;

        /**
         * Artist name
         *
         * @type {String|null}
         * @private
         */
        this._artist = item.artist || null;

        /**
         * Track duration in seconds (server information)
         *
         * @type {Number|null}
         */
        this._duration = item.duration || null;

        /**
         * Track source
         *
         * @type {String|undefined}
         * @private
         */
        this._src = item.src;

        /**
         * Howl instance
         *
         * @type {Howl|null}
         * @private
         */
        this._sound = null;

        /**
         * Sound id
         *
         * @type {Number|null}
         * @private
         */
        this._soundId = null;

        /**
         * Control element
         *
         * @type {Element|null}
         * @private
         */
        this._playEl = null;

        /**
         * Playing state
         *
         * @type {boolean}
         * @private
         */
        this._playing = false;

        /**
         * Pause state
         *
         * @type {boolean}
         * @private
         */
        this._paused = false;
    }

    /**
     * Get id
     *
     * @returns {Number}
     */
    getId() {
        return this._id;
    }

    /**
     * Initialize Howl
     *
     * @param sound {Howl}
     * @returns {Track}
     */
    setSound(sound) {
        this._sound = sound;

        return this;
    }

    /**
     * Is Howl initialized
     *
     * @returns {boolean}
     */
    hasSound() {
        return (null !== this._sound);
    }

    /**
     * Set playing
     *
     * @param playing
     * @returns {Track}
     */
    setPlaying(playing) {
        this._playing = playing;

        return this;
    }

    /**
     * Is track playing
     *
     * @returns {Boolean}
     */
    isPlaying() {
        return this._playing;
    }

    /**
     * Is track loading
     *
     * @returns {boolean}
     */
    isLoading() {
        return (this._sound) ? ('loading' === this._sound.state()) : false;
    }

    /**
     * Get name
     *
     * @returns {String}
     */
    getName() {
        return this._name;
    }

    /**
     * Get source
     *
     * @returns {String|null}
     */
    getSrc() {
        return (typeof this._src === 'undefined') ? null : this._src;
    }

    /**
     * Set play element
     *
     * @param el {Element}
     * @returns {Track}
     */
    setPlayEl(el) {
        this._playEl = el;

        return this;
    }

    /**
     * Play track
     *
     * @returns {Track}
     */
    play() {
        switch (this._sound.state()) {
            case 'unloaded':
                this._sound.load();
                break;

            case 'loaded':
                if (!this._paused) {
                    this._trackEvent('player', 'play', `${this._artist} - ${this._name}`);
                }

                if (null === this._soundId) {
                    this._soundId = this._sound.play();
                } else {
                    this._sound.play(this._soundId);
                }

                break;
        }

        this._playing = true;
        this._paused = false;
        this._playEl.className = 'control-button control-play playing';

        return this;
    }

    /**
     * Pause track
     *
     * @returns {Track}
     */
    pause() {
        this._playing = false;
        this._paused = true;
        this._playEl.className = 'control-button control-play';

        if ('loaded' === this._sound.state()) {
            this._trackEvent('player', 'pause', `${this._artist} - ${this._name}`);
            this._sound.pause(this._soundId);
        }

        return this;
    }

    /**
     * Stop track
     *
     * @returns {Track}
     */
    stop() {
        this._playing = false;
        this._paused = false;
        this._playEl.className = 'control-button control-play';

        switch (this._sound.state()) {
            case 'loading':
                this._sound.unload();

                window.stop();
                document.execCommand("Stop");
                break;

            case 'loaded':
                this._sound.stop(this._soundId);
                break;
        }

        return this;
    }

    /**
     * Seek track
     *
     * @param seek {Number}
     * @returns {Track}
     */
    seek(seek) {
        this._trackEvent('player', 'seek', `${this._artist} - ${this._name}`);
        this._sound.seek(seek, this._soundId);

        return this;
    }

    /**
     * Get seek
     *
     * @param [format] {Boolean}
     * @returns {Number|String}
     */
    getSeek(format) {
        let seek  = 0;

        if (this._sound) {
            seek = this._sound.seek() || 0;
        }

        if (true === format) {
            seek = Track.formatTime(Math.round(seek));
        }

        return seek;
    }

    /**
     * Get track duration
     *
     * Primarily try to get duration from track definition (e.g. server information) if is not defined try to get
     * duration from loaded track (if is loaded)
     *
     * @returns {Number}
     */
    getDuration() {
        let duration = this._duration || 0;

        if (null === this._duration && this._sound) {
            duration = this._sound.duration();
        }

        return duration;
    }

    /**
     * Format time
     *
     * @param time {Number}
     * @returns {String}
     */
    static formatTime(time) {
        let minutes = Math.floor(time / 60) || 0,
            seconds = Math.floor(time - minutes * 60) || 0;

        return (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
    }

    /**
     * @param category {String}
     * @param action {String}
     * @param name {String}
     *
     * @private
     */
    _trackEvent(category, action, name) {
        if (typeof this._aq === 'string' && typeof window[this._aq] === 'object' && typeof window[this._aq].push === 'function') {
            window[this._aq].push(['trackEvent', category, action, name]);
        }
    }
}
