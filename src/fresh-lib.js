_checkTagValidity = tag => {
    const isValidTag = /^[a-z]{2,}-\d{1,10}$/i.test(tag.innerText) != false;
    // No need to convert already processed tags
    const isTranslated = tag.parentNode.tagName == 'A';
    return isValidTag && !isTranslated;
}

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
        this.ticketsBlock = 'tbody.lt-body';
        this.tagElement = 'span.list-item';
    }

    // Enumerate tickets and return an array of their tags
    getTags = () => {
        let tickets = Array.from(this.root.querySelector(this.ticketsBlock).children);
        let tags = [];
        for (let i = 0; i < tickets.length; i++) {
            let ticketTags = tickets[i].querySelectorAll(this.tagElement);
            tags.push(Array.from(ticketTags));
        }
        return tags;
    }
}

// Class for a card layout screen of a filter view
class CardView extends FilterView {
    constructor(root) {
        super(root);
        this.tagElement = "div.ticket-tag-wrap " + this.tagElement;
    }
}

// Class for a table layout screen of a filter view
class TableView extends FilterView {
    constructor(root) {
        super(root);
        this.tagElement = "div.show-more-list-wrapper " + this.tagElement;
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

    getTags = () => {
        let tags = [];
        let ticketTags = this.root.querySelectorAll(this.tagElement);
        tags.push(Array.from(ticketTags.filter(_checkTagValidity)));
        return tags;
    }
}

// Creates a link element from a text.
function _jiraLinkFromText(document, text) {
    let link = document.createElement("a");
    link.href = JIRALINK + text.toUpperCase();
    return link;
};


function transformTicketTags(ticketTags) {
    // Choose only tags where text follows the pattern.
    let jiraTags = ticketTags.filter(tag => _checkTagValidity);
    if (jiraTags.length) {
        return;
    }
    console.debug("Ticket tags to proces:", jiraTags.length);
    // Wrap the tag with a link element.
    jiraTags.forEach(function (tag) {
        let link = _jiraLinkFromText(tag.innerText);
        tag.parentNode.insertBefore(link, tag);
        link.appendChild(tag);
    });
};

exports.CardView = CardView;
exports.TableView = TableView;
exports.TicketView = TicketView;