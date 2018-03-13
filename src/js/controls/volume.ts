import IEvent from '../components/interfaces/general/event';
import { addEvent } from '../events';
import Player from '../player';

/**
 *
 * @class Volume
 * @description  Class that renders volume slider and mute button, and registers events to update them
 */
class Volume {
    public player: Player;
    private button: HTMLButtonElement;
    private volumeContainer: HTMLDivElement;
    private display: HTMLProgressElement;
    private slider: HTMLInputElement;
    private buttonEvents: IEvent;
    private sliderEvents: IEvent;
    private events: IEvent;
    private volume: number;

    /**
     *
     * @param {Player} player
     * @returns {Volume}
     */
    constructor(player: Player) {
        this.player = player;
        this.volumeContainer = document.createElement('div');
        this.volumeContainer.className = 'om-controls__volume';

        this.slider = document.createElement('input');
        this.slider.type = 'range';
        this.slider.className = 'om-controls__volume--input';
        const volume = Math.floor(this.player.media.volume * 100);

        this.slider.value = this.player.media.volume;
        this.slider.setAttribute('min', '0');
        this.slider.setAttribute('aria-valuemin', '0');
        this.slider.setAttribute('max', '1');
        this.slider.setAttribute('aria-valuemax', '1');
        this.slider.setAttribute('step', '0.1');
        this.slider.setAttribute('aria-valuetext', `${volume}%`);

        this.display = document.createElement('progress');
        this.display.className = 'om-controls__volume--display';
        this.display.setAttribute('max', '10');
        this.display.setAttribute('role', 'presentation');
        this.display.value = this.player.media.volume * 10;

        this.volumeContainer.appendChild(this.slider);
        this.volumeContainer.appendChild(this.display);

        // Use as backup when mute is clicked
        this.volume = this.player.media.volume;
        this.button = document.createElement('button');
        this.button.type = 'button';
        this.button.className = 'om-controls__mute';
        this.button.innerHTML = '<span class="om-sr">Mute</span>';

        const updateSlider = (element: any) => {
            const mediaVolume = element.volume * 1;
            const vol = Math.floor(mediaVolume * 100);
            this.slider.setAttribute('aria-valuenow', `${vol}`);
            this.slider.setAttribute('aria-valuetext', `${vol}%`);
            this.slider.value = `${element.volume}`;
            this.display.value = (mediaVolume * 10);
        };

        const updateButton = (element: any) => {
            if (element.volume <= 0.5 && element.volume > 0) {
                this.button.classList.remove('om-controls__mute--muted');
                this.button.classList.add('om-controls__mute--half');
            } else if (element.volume === 0) {
                this.button.classList.add('om-controls__mute--muted');
                this.button.classList.remove('om-controls__mute--half');
            } else {
                this.button.classList.remove('om-controls__mute--muted');
                this.button.classList.remove('om-controls__mute--half');
            }
        };

        const updateVolume = (event: any) => {
            const el = this.player.activeElement();
            el.volume = event.target.value;
            this.volume = event.target.value;

            const e = addEvent('volumechange');
            this.player.element.dispatchEvent(e);
        };

        this.events = {};
        this.events['volumechange'] = () => {
            const el = this.player.activeElement();
            updateSlider(el);
            updateButton(el);
        };
        this.events['loadedmetadata'] = () => {
            const el = this.player.activeElement();
            if (el.muted) {
                el.volume = 0;
                const e = addEvent('volumechange');
                this.player.element.dispatchEvent(e);
            }
        };
        this.sliderEvents = {};
        this.sliderEvents['input'] = updateVolume.bind(this);
        this.sliderEvents['change'] = updateVolume.bind(this);

        this.buttonEvents = {};
        this.buttonEvents['click'] = () => {
            const el = this.player.activeElement();
            el.muted = !el.muted;

            if (el.muted) {
                el.volume = 0;
            } else {
                el.volume = this.volume;
            }
            const event = addEvent('volumechange');
            this.player.media.element.dispatchEvent(event);
        };

        return this;
    }

    /**
     *
     * @returns {Volume}
     * @memberof Volume
     */
    public register() {
        this.button.addEventListener('click', this.buttonEvents['click']);
        Object.keys(this.events).forEach(event => {
            this.player.media.element.addEventListener(event, this.events[event]);
        });

        Object.keys(this.sliderEvents).forEach(event => {
            this.slider.addEventListener(event, this.sliderEvents[event]);
        });

        return this;
    }

    public unregister() {
        Object.keys(this.sliderEvents).forEach(event => {
            this.slider.addEventListener(event, this.sliderEvents[event]);
        });

        this.player.media.element.removeEventListener('volumechange', this.events['volumechange']);

        this.button.removeEventListener('click', this.buttonEvents['click']);

        this.buttonEvents = {};
        this.sliderEvents = {};
        this.events = {};

        return this;
    }

    /**
     *
     * @param {HTMLDivElement} controls
     * @returns {Volume}
     * @memberof Volume
     */
    public build(controls: HTMLDivElement) {
        controls.appendChild(this.button);
        controls.appendChild(this.volumeContainer);
        return this;
    }
}

export default Volume;
