import { getGalery, getPhotographerId, supportsTemplates } from "../../components/query.js";
import { addLightboxListeners, removeLightboxListeners, toggleLightboxListeners } from "./lightbox_listeners.js";
import { appendLightboxMedia } from "./lightbox_media.js";

export async function openLightboxModal(mediaId) {
    const photographerId = getPhotographerId();
    const galery = await getGalery(photographerId);
    const mediaObject = galery.find(media => media.id === mediaId);

    if (supportsTemplates()) {
        document.body.appendChild(document.getElementById('template_lightbox').content);
    } else {
        createLightboxDOM();
    }
    document.getElementById('lightbox_modal').style.setProperty('display', 'flex');

    appendLightboxMedia(photographerId, mediaObject, 'first');
    addLightboxListeners();
    //toggleLightboxListeners('add');
};

export function closeLightboxModal() {
    const lightbox = document.getElementById('lightbox_modal');
    lightbox.style.setProperty('display', 'none');
    removeLightboxListeners();
    //toggleLightboxListeners('remove');
}

export async function getFollowingMedia(direction) {
    const photographerId = getPhotographerId();
    const galery = await getGalery(photographerId);
    const mediaId = parseInt(document.getElementById('lightbox_modal_media').dataset.mediaid)
    const thisMediaIndex = galery.findIndex(media => media.id === mediaId)
    const galeryProxy = new Proxy(galery, {
        get(target, prop) {
            if (!isNaN(prop)) {
                prop = parseInt(prop);
                if (prop < 0) {
                    prop += target.length;
                }
                if (prop === target.length) {
                    prop -= target.length;
                }
            }
            return target[prop];
        }
    });
    let followingMedia;
    if (direction === 'next') {
        followingMedia = galeryProxy[thisMediaIndex + 1]
    } else if (direction === 'previous') {
        followingMedia = galeryProxy[thisMediaIndex - 1]
    }
    const lightboxFigure = document.getElementById('lightbox_modal_main');
    lightboxFigure.removeAttribute('data-direction');
    appendLightboxMedia(photographerId, followingMedia , direction);
}

function createLightboxDOM() {
/* =============================== HTML element made by createLightboxDOM() ===============================
|-- MODAL               #lightbox_modal
    |-- DIV             .lightbox_modal_arrow + #left-arrow
    |-- DIV             #lightbox_modal_main
    |   |--IMG/VIDEO    #lightbox_modal_media
    |   |--SPAN         #lightbox_modal_title
    |
    |-- DIV             .lightbox_modal_arrow + #right-arrow
    |-- IMG             #lightbox_modal_close_button
============================================================================================================*/
    const lightbox = document.createElement('dialog');
    lightbox.setAttribute('id', 'lightbox_modal');

    const leftArrow = document.createElement('div');
    leftArrow.setAttribute('id','left-arrow');
    leftArrow.classList.add('lightbox_modal_arrow');

    leftArrow.setAttribute('data-directioninput','previous');
    leftArrow.textContent= '<';

    const figure = document.createElement('figure');
    figure.setAttribute('id', 'lightbox_modal_main');

    const rightArrow = document.createElement('div');
    rightArrow.setAttribute('id','right-arrow');
    rightArrow.setAttribute('data-directioninput','next');
    rightArrow.classList.add('lightbox_modal_arrow');
    rightArrow.textContent= '>';

    const lightboxCloseButton = document.createElement('img');
    lightboxCloseButton.setAttribute('src', 'assets/icons/close.svg');
    lightboxCloseButton.setAttribute('id', 'lightbox_modal_close_button');

    lightbox.appendChild(leftArrow);
    lightbox.appendChild(figure);
    lightbox.appendChild(rightArrow);
    lightbox.appendChild(lightboxCloseButton);

    document.body.appendChild(lightbox);
}
