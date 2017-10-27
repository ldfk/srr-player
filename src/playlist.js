import Track from './track';

/**
 * Playlist
 */
export default class Playlist {

    /**
     * Constructor
     *
     * @param items {Array}
     */
    constructor(items) {
        /**
         * Track list
         *
         * @type {Track[]}
         * @private
         */
        this._tracks = [];

        /**
         * Current track
         *
         * @type {Track|null}
         * @private
         */
        this._current = null;

        let self = this;

        items.forEach(function (item, index) {
            let track = new Track(index, item);

            if (null === self._current && null !== track.getSrc()) {
                self._current = track;
            }

            self._tracks.push(track);
        });
    }

    /**
     * Get tracks list
     *
     * @returns {Track[]}
     */
    getTracks() {
        return this._tracks;
    }

    /**
     * Get track with id or current track if not exists
     *
     * @param id {Number}
     * @returns {Track|undefined}
     */
    getTrack(id) {
        let track = this._tracks[id];

        if (typeof track === 'undefined') {
            if (typeof id !== 'undefined') {
                console.warn("Playlist: track not found", id);
            }

            track = this._current;
        }

        return track;
    }

    /**
     * Get previous playable track
     *
     * @returns {Track}
     */
    getPrevTrack() {
        let track = null,
            id = this._current.getId();

        id--;

        while (null === track) {
            if (id < 0) {
                id = this._tracks.length - 1;
            }

            if (null !== this._tracks[id].getSrc()) {
                track = this._tracks[id];
            }

            id--;
        }

        return track;
    }

    /**
     * Get next playable track
     *
     * @returns {Track}
     */
    getNextTrack() {
        let track = null,
            id = this._current.getId();

        id++;

        while (null === track) {
            if (id >= this._tracks.length) {
                id = 0;
            }

            if (null !== this._tracks[id].getSrc()) {
                track = this._tracks[id];
            }

            id++;
        }

        return track;
    }

    /**
     * Set current track
     *
     * @param track {Track}
     * @returns {Playlist}
     */
    setCurrentTrack(track) {
        this._current = track;

        return this;
    }

    /**
     * Get current track
     *
     * @returns {Track|null}
     */
    getCurrentTrack() {
        return this._current;
    }
}