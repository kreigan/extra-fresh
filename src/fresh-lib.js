// A base class for all screens, is not supposed to be instantiated directly
class ScreenType {
    constructor(root) {
        this.root = root;
    }
}

// A base class for all filter views
class FilterView extends ScreenType {
    constructor(root) {
        super(root);
        this.ticketsBlock = 'div.card-view.lt-body-wrap table tbody';
        this.tagElement = 'span.list-item';
    }

    static hiddenSelector = 'div#ember-basic-dropdown-wormhole > div.ember-basic-dropdown-content > div.list-item';

    // Enumerate tickets and return an array of their tags
    getTags = () => {
        let tickets = this.root.querySelector(this.ticketsBlock);
        if (!tickets) {
            throw `Couldn't find the ticket root block '${this.ticketsBlock}'`;
        }

        let tags = [];
        for (let ticket of tickets.children) {
            let ticketTags = ticket.querySelectorAll(this.tagElement);
            for (let tag of ticketTags) {
                if (_checkTagValidity(tag)) {
                    tags.push(tag);
                }
            }
        }

        return tags;
    }
}

// Class for a card layout screen of a filter view
class CardView extends FilterView {
    constructor(root) {
        super(root);
        this.tagElement = `div.ticket-tag-wrap ${this.tagElement}`;
    }
}

// Class for a table layout screen of a filter view
class TableView extends FilterView {
    constructor(root) {
        super(root);
        this.tagElement = `div.show-more-list-wrapper ${this.tagElement}`
    };

    // Check if tags are displayed at all
    _isTagsColumnShown = () => this.root.querySelector('thead.lt-head') != undefined;

    // Redefines getTags() to call it only if tags are shown
    getTags = () => this._isTagsColumnShown() ? super.getTags() : [];
}

class TicketView extends ScreenType {
    constructor(root) {
        super(root);
        this.tagElement = 'div.ticket-tags span.tag-options';
    }

    getTags = () => getValidTags(this.root.querySelectorAll(this.tagElement));
}

function getValidTags(tags) {
    let validTags = [];
    for (let tag of tags) {
        if (_checkTagValidity(tag)) {
            validTags.push(tag);
        }
    };
    return validTags;
}

function _checkTagValidity(tag) {
    const isValidTag = /^[a-z]{2,}-\d{1,10}$/i.test(tag.innerHTML) != false;
    // No need to convert already processed tags
    const isTranslated = tag.parentNode.tagName == 'A';
    return isValidTag && !isTranslated;
}

function _getUrlFromText(text, baseUrl) {
    return new URL(text, baseUrl).href;
}

// Creates a link element from a text.
function convertTagToUrl(tag, baseUrl) {
    const tagValue = new String(tag.innerHTML).trim().toUpperCase();
    let parsedUrl = _getUrlFromText(tagValue, baseUrl);

    let parentTag = tag.parentElement;
    let link = tag.ownerDocument.createElement('a');
    link.setAttribute('href', parsedUrl.href);
    link.setAttribute('target', '_blank');

    parentTag.insertBefore(link, tag);
    link.appendChild(tag);
}

exports.FilterView = FilterView;
exports.CardView = CardView;
exports.TableView = TableView;
exports.TicketView = TicketView;

exports.convertTagToUrl = convertTagToUrl;