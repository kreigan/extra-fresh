const jsdom = require('jsdom'),
    { JSDOM } = jsdom,
    expect = require('chai').expect,
    lib = require('../src/fresh-lib');

var baseUrl = 'http://localhost.com';
const validTags = 4,
    tagsForTest = [
        'TST-1',
        'TST-1',
        'TST-3908',
        '1234',
        'TST-TST',
        '---TST///',
        '1TST-1',
        'tag',
        ' &nbsp;   ',
        'TST-0000',
        '---',
        '{{123}}'
    ];

var document;
let testTags;

function _getDocFromFile(path) {
    const options = { contentType: 'text/html' };
    return JSDOM.fromFile(path, options).then(dom => {
        document = dom.window.document;
    });
}

function _prepareTicketTags() {
    const tagTemplate = document.querySelector('li > span.tag-options');
    const list = tagTemplate.parentElement.parentElement;
    // Add all test tags from the array except for the first one
    // as its value will be replaced later
    tagsForTest.slice(1).forEach(() => {
        list.appendChild(list.firstElementChild.cloneNode(true));
    });
    for (let index = 0; index < list.childElementCount; index++) {
        const tag = list.children[index].firstElementChild;
        tag.innerHTML = tagsForTest[index];
    }
}

function _prepareFilterTags(visibleSelector, hiddenSelector = lib.FilterView.hiddenSelector, maxVisibleTags = 3) {
    const templates = {
        visible: document.querySelector(visibleSelector),
        hidden: document.querySelector(hiddenSelector)
    }, tags = {
        visible: new Array(maxVisibleTags),
        hidden: new Array(tagsForTest.length - maxVisibleTags)
    };

    templates.visible.innerHTML = tagsForTest[0];
    tags.visible[0] = templates.visible;

    for (var i = 1; i < maxVisibleTags; i++) {
        let newNode = templates.visible.cloneNode();
        newNode.innerHTML = tagsForTest[i];
        tags.visible[i] = newNode;
    }

    // Move all visible tags to their common parent
    tags.visible.forEach(tag => {
        templates.visible.parentElement.appendChild(tag);
    });

    templates.hidden.innerHTML = tagsForTest[maxVisibleTags];
    tags.hidden[maxVisibleTags] = templates.hidden;

    // The first 3 tags are visible so make all other hidden
    for (let i = maxVisibleTags + 1; i < tagsForTest.length; i++) {
        let newNode = templates.hidden.cloneNode();
        newNode.innerHTML = tagsForTest[i];
        tags.hidden[i] = newNode;
    }

    // Move all hidden tags to their common parent
    tags.hidden.forEach(tag => {
        templates.hidden.parentElement.appendChild(tag);
    });

    return tags;
}

function _prepareCardViewTags() {
    return _prepareFilterTags('div.ticket-tag-wrap div.list-items > span.list-item');
}

function _prepareTableViewTags() {
    return _prepareFilterTags('div[data-test-id="tags_test_label"] div.list-items > span.list-item');
}

describe('Tags', () => {
    describe('in ticket', () => {
        before(() => {
            return _getDocFromFile('test/assets/ticket-structure-tags.html').then(() => {
                _prepareTicketTags();
            });
        })
        it('should be converted', () => {
            let screen = new lib.TicketView(document.getElementById('ticket-details'));
            let tags = screen.getTags();

            expect(tags).to.have.lengthOf(validTags);
            tags.forEach(tag => lib.convertTagToUrl(tag, baseUrl));
            expect(document.querySelectorAll('li > a > span')).to.have.lengthOf(validTags);
            // Check that there is no double convertion
            screen.getTags().forEach(tag => lib.convertTagToUrl(tag, baseUrl));
            expect(document.querySelectorAll('li > a > span')).to.have.lengthOf(validTags);
        });
    });
    describe('in card layout', () => {
        before(() => {
            return _getDocFromFile('test/assets/card-structure-tags.html').then(() => {
                testTags = _prepareCardViewTags();
            });
        })
        it('should be converted', () => {
            let screen = new lib.CardView(document.querySelector('div.card-view.lt-body-wrap'));
            let ticketTags = screen.getTags();

            expect(ticketTags).to.have.lengthOf(validTags);
            ticketTags.forEach(tag => lib.convertTagToUrl(tag, baseUrl));
            expect(document.querySelectorAll('li > a > span')).to.have.lengthOf(validTags);
            // Check that there is no double convertion
            screen.getTags().forEach(tag => lib.convertTagToUrl(tag, baseUrl));
            expect(document.querySelectorAll('li > a > span')).to.have.lengthOf(validTags);
        });
    });
    describe('in table layout', () => {
        before(() => {
            const options = { contentType: 'text/html' };
            return JSDOM.fromFile('test/assets/table-structure-tags.html', options).then(dom => {
                testTags = _prepareTableViewTags();
            });
        })
        it('should be converted', () => {
            let screen = new lib.TableView(document.getElementById('ticket-details'));
            let tags = screen.getTags();

            expect(tags).to.have.lengthOf(3);
            tags.forEach(tag => lib.convertTagToUrl(tag, baseUrl));
            expect(document.querySelectorAll('li > a > span')).to.have.lengthOf(3);
            // Check that there is no double convertion
            screen.getTags().forEach(tag => lib.convertTagToUrl(tag, baseUrl));
            expect(document.querySelectorAll('li > a > span')).to.have.lengthOf(3);
        });
    });
});