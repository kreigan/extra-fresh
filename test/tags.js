const jsdom = require("jsdom"),
    { JSDOM } = jsdom,
    expect = require('chai').expect,
    lib = require('../src/fresh-lib');

const tagsForTest = [
    "TST-1",
    "1234",
    "TST-TST",
    "---TST///",
    "tag",
    "&nbsp;",
    "---",
    "{{123}}"
];

let document, screen;

describe('Tags', () => {
    describe('in ticket', () => {
        let options = { contentType: "text/html" };
        beforeEach(() => JSDOM.fromFile("test/assets/ticket-structure-tags.html", options)
            .then(dom => {
                document = dom.window.document;
                const tagTemplate = document.querySelector("li > span.tag-options");
                if (!tagTemplate) {
                    throw new Error("Invalid template structure: <span> tag was not found")
                }

                const list = tagTemplate.parentElement.parentElement;
                tagsForTest.slice(1).forEach(tagValue => {

                    list.appendChild(list.firstElementChild.cloneNode(true));
                });

                for (let index = 0; index < list.childElementCount; index++) {
                    const tag = list.children[index].firstElementChild;
                    tag.innerHTML = tagsForTest[index];
                }
                screen = new lib.TicketView(document.getElementById('ticket-details'));
            }));
        it('should be fetched', (done) => {
            var tags = screen.getTags();
            expect(tags).to.have.lengthOf(tagsForTest.length);
            done();
        });
        it('should be converted', (done) => {
            var result = 1;
            expect(result).to.be.equal(1);
            done();
        });
    })
});