const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const should = require('chai').should();
const lib = require('../src/fresh-lib');

let document;
let root;
let screen;

describe('Tags', () => {
    describe('ticket', () => {
        beforeEach(() => JSDOM.fromFile("test/assets/ticket-structure-tags.html")
            .then(dom => {
                document = dom.window.document;
                root = document.getElementById('ticket-details');
                screen = new lib.TicketView(root);
            }));
        it('should be converted', (done) => {
            var result = 1;
            result.should.be.equal(1);
            done();
        });
    })
});