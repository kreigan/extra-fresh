// ==UserScript==
// @name         extra-fresh
// @namespace    https://cloudblue.freshdesk.com
// @version      0.1.0
// @description  Adds extra functionality to Freshdesk.
// @author       Aleksandr Noskov
// @homepage     https://github.com/alexbrownies/extra-fresh
// @updateURL    https://github.com/alexbrownies/extra-fresh/extra-fresh.js
// @match        https://cloudblue.freshdesk.com/a/tickets/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

const JIRALINK = "https://jira.int.zone/browse/";

class ScreenType {
    constructor(root) {
        this.root = root;
    }
}

// Defines a base class for filter views.
class FilterView extends ScreenType {
    constructor(root) {
        super(root);
        this.ticketsBlock = 'tbody.lt-body';
        this.tagElement = 'span.list-item';
    }

    // Fetches tickets and returns an array of their tags.
    getTags() {
        let tickets = Array.from(this.root.querySelector(this.ticketsBlock).children);
        let tags = [];
        for (let i = 0; i < tickets.length; i++) {
            let ticketTags = tickets[i].querySelectorAll(this.tagElement);
            tags.push(Array.from(ticketTags));
        }
        return tags;
    }
}

class CardView extends FilterView {
    constructor(root) {
        super(root);
        this.tagElement = "div.ticket-tag-wrap " + this.tagElement;
    }
}

// Used for table layout of a filter view.
// Redefines the getTags() method to call only only if Tags column is shown.
class TableView extends FilterView {
    constructor(root) {
        super(root);
        this.tagElement = "div.show-more-list-wrapper " + this.tagElement;
    };
    isTagsColumnShown() {
        return this.root.querySelector('thead.lt-head') != undefined;
    };
    getTags() {
        return this.isTagsColumnShown() ? super.getTags() : [];
    }
}

class TicketView extends ScreenType {
    constructor(root) {
        super(root);
        this.tagElement = 'div.ticket-tags span.tag-options';
    }

    getTags() {
        let tags = [];
        let ticketTags = this.root.querySelectorAll(this.tagElement);
        tags.push(Array.from(ticketTags));
        return tags;
    }
}

function transformTicketTags(ticketTags) {
    // Choose only tags where text follows the pattern.
    let jiraTags = ticketTags.filter(
        (tag) => {
            const isValidTag = /^[a-z]{2,}-\d{1,10}$/i.test(tag.innerText) != false;
            const isTranslated = tag.parentNode.tagName == 'A';
            return isValidTag && !isTranslated;
        });
        if (jiraTags.length == 0) {
            return;
        }
    console.debug("Ticket tags to proces:", jiraTags.length);
    // Wrap the tag with a link element.
    jiraTags.forEach(function(tag) {
        let link = jiraLinkFromText(tag.innerText);
        tag.parentNode.insertBefore(link, tag);
        link.appendChild(tag);
    });
};

// Create a link element from a text.
function jiraLinkFromText(text) {
    let link = document.createElement("a");
    link.href = JIRALINK + text.toUpperCase();
    return link;
};

// Retry every 5 seconds.
window.setInterval(() => {
    'use strict';

    var root = document.getElementById('ticket-details');
    var screen = null;
    if (root != null) {
        screen = new TicketView(root);
    } else {
        root = document.querySelector('div.card-view.lt-body-wrap');
        if (root != null) {
            screen = new CardView(root);
        } else {
            root = document.querySelector('div.list.lt-body-wrap');
            if (root != null) {
                screen = new TableView(root);
            }
        }
    }
    if (screen == null) {
        return;
    }
    screen.getTags().forEach(transformTicketTags);
}, 5000);