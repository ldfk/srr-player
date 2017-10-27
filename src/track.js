/**
 * Track
 */
export default class Track {

    /**
     * Constructor
     *
     * @param id {Number}
     * @param item {Object}
     */
    constructor(id, item) {

        /**
         * Track id
         *
         * @type {Number}
         * @private
         */
        this._id = id;

        /**
         * Track name
         *
         * @type {String}
         * @private
         */
        this._name = item.name;

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
        this._playing = true;
        this._playEl.className = 'control-button control-play playing';

        switch (this._sound.state()) {
            case 'unloaded':
                this._sound.load();
                break;

            case 'loaded':
                this._sound.play();
                break;
        }

        return this;
    }

    /**
     * Pause track
     *
     * @returns {Track}
     */
    pause() {
        this._playing = false;
        this._playEl.className = 'control-button control-play';

        if ('loaded' === this._sound.state()) {
            this._sound.pause();
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
        this._playEl.className = 'control-button control-play';

        switch (this._sound.state()) {
            case 'loading':
                this._sound.unload();

                window.stop();
                document.execCommand("Stop");
                break;

            case 'loaded':
                this._sound.stop();
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
        this._sound.seek(seek);

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
            seek = Track._formatTime(Math.round(seek));
        }

        return seek;
    }

    /**
     * Get track duration
     *
     * @returns {Number}
     */
    getDuration() {
        return this._sound.duration();
    }

    /**
     * Format time
     *
     * @param time {Number}
     * @returns {String}
     * @private
     */
    static _formatTime(time) {
        let minutes = Math.floor(time / 60) || 0,
            seconds = (time - minutes * 60) || 0;

        return (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
    }
}
