/**
 * This is required for element rendering to be possible
 * @type {PlatformElement}
 */
(function() {
  var PLACEHOLDER = "\
    1, Placeholder\n\
    1a, Placeholder\n\
    1a1, Placeholder, #\n\
    1a2, Placeholder, #\n\
    2, Placeholder\n\
    2a, Placeholder, #\n\
    2b, Placeholder, #\n\
    3, Placeholder\n\
    3a, Placeholder, #\n\
    "

  var $accordion = $('<div class="nested-accordion"></div>');

  function splitClean(multilineString) {
    return multilineString.split("\n").map(function(line) { return line.trim() }).filter(_.identity);
  }

  var NestedAccordion = PlatformElement.extend({
    initialize: function(options) {
      _.extend(this, options);
      var structureInput = (this.settings && this.settings.get("structure")) || PLACEHOLDER;
      var lines = _.map(splitClean(structureInput), function(line) {
        var components = line.split(", ");
        var structure = components[0].trim();
        var nesting = structure.length - 1;
        return {
          structure: structure,
          nesting: nesting,
          label: components[1],
          url: components[2]
        }
      });

      _.each(lines, this.insertLine.bind(this));
      this.openToCurrentUrl($accordion)
      this.$el.append($accordion);

      $('.folder').click(function(e) {
        e.stopPropagation();
        $(this).children('.children').slideToggle();
        $(this).toggleClass('opened');
      });
    },

    linkTemplate: function() {
      return "<section class='nesting-{{nesting}}' {{structure}}><a href='{{url}}'>{{label}}</a></section>"
    },

    renderTemplate: function(template, line) {
      return template.replace(/\{\{(\w+)\}\}/g, function(fullMatch, parensMatch) {
        return line[parensMatch];
      });
    },

    folderTemplate: function() {
      return "\
      <div class='folder' data-structure={{structure}}>\
        <section class='folder-label nesting-{{nesting}}'>\
          <svg class='folder-arrow' fill='#fff' viewBox='200 300 1300 1300' xmlns='http://www.w3.org/2000/svg'><path d='M1171 960q0 13-10 23l-466 466q-10 10-23 10t-23-10l-50-50q-10-10-10-23t10-23l393-393-393-393q-10-10-10-23t10-23l50-50q10-10 23-10t23 10l466 466q10 10 10 23z'/></svg>\
          {{label}}\
        </section>\
        <div class='children' style='display: none;'>\
        </div>\
      </div>"
    },

    getParentStructure: function(lineStructure) {
      var structure = lineStructure.match(/[a-zA-Z]+|[0-9]+/g);
      var parentStructure = structure.slice(0, -1).join("");
      return parentStructure;
    },

    insertLine: function(line) {
      var parentStructure = this.getParentStructure(line.structure);
      if (!parentStructure.length) {
        $accordion.append(this.renderLine(line));
      } else {
        var selector = '[data-structure=' + parentStructure + '] > .children'
        $accordion.find(selector).append(this.renderLine(line));
      }
    },

    renderLine: function(line) {
      if (line.url) {
        return this.renderTemplate(this.linkTemplate(), line);
      } else {
        return this.renderTemplate(this.folderTemplate(), line);
      }
    },

    openToCurrentUrl: function(accordion) {
      var $currentLink = $accordion.find("[href='" + location.pathname + "']");
      $currentLink.closest('section').addClass('current');
      $currentLink.parentsUntil('.nested-accordion', '.folder').addClass('opened');
      $currentLink.parentsUntil('.nested-accordion', '.children').toggle();
    }
  });

  window.NestedAccordion = NestedAccordion;
  return NestedAccordion;
})();
