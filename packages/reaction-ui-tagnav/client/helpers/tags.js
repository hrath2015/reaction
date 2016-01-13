/**
 * Reaction TagNav shared helpers
 * @type {Object}
 */
ReactionUI.TagNav.Helpers = {
  subTags(parentTag) {
    if (_.isArray(parentTag.relatedTagIds)) {
      const tags = ReactionCore.Collections.Tags.find({
        isTopLevel: false,
        _id: {
          $in: parentTag.relatedTagIds
        }
      }).fetch();

      const poop = parentTag.relatedTagIds.map((tagId) => {
        return _.find(tags, (tagObject) => {
          return tagObject._id === tagId;
        });
      });

      // console.log("*******************************", poop);
      // console.log("Tags (helper level)", tags.map(tag => tag._id));
      // console.log("Tags (helper level ACTUAL)", parentTag.relatedTagIds.map(tag => tag));
      return poop;
    }

    return false;
  },

  currentTag() {
    return Session.get("currentTag");
  },

  getTags() {
    let tags = [];

    tags = ReactionCore.Collections.Tags.find({
      isTopLevel: true
    }, {
      sort: {
        position: 1
      }
    }).fetch();
    /*
    if (this.tagIds) {
      for (let relatedTagId of this.tagIds) {
        if (!_.findWhere(tags, {
          _id: relatedTagId
        })) {
          tags.push(Tags.findOne(relatedTagId));
        }
      }
    }*/

    if (this.tag) {
      Session.set("currentTag", this.tag._id);
    } else {
      Session.set("currentTag", "");
    }

    return tags;
    // there are cases where
    // we'll have no tags, and sort will error
    // so we check length for safety
    // if (tags) {
    //   tags.sort(function (a, b) {
    //     return a.position - b.position;
    //   });
    //   return tags;
    // }
  },

  createTag(tagName, tagId, parentTag) {
    let parentTagId;

    if (parentTag) {
      parentTagId = parentTag._id;
    }

    Meteor.call("shop/updateHeaderTags", tagName, null, parentTagId,
      function (error) {
        if (error) {
          Alerts.add("Tag already exists, duplicate add failed.",
            "danger", {
              autoHide: true
            });
        }
      });
  },

  updateTag(tagId, tagName, parentTagId) {
    Meteor.call("shop/updateHeaderTags", tagName, tagId, parentTagId,
      function (error) {
        if (error) {
          Alerts.add("Tag already exists, duplicate add failed.",
            "danger", {
              autoHide: true
            });
        }
        // return template.$(".tags-submit-new").val("").focus();
      });
  },

  moveTagToNewParent(movedTagId, toListId, toIndex, ofList) {
    // console.log(`Would Add item ${movedTagId} to list ${toListId}, with index ${toIndex}, of list`, ofList);
    const newList = [
      ...ofList.map((tag) => tag._id),
      movedTagId
    ];

    const result = ReactionCore.Collections.Tags.update(toListId,
      {
        $set: {
          relatedTagIds: newList
        }
      }
    );

    return result;
  },

  sortTags(tagIds, parentTag) {
    if (_.isArray(tagIds)) {
      if (_.isEmpty(parentTag)) {
        // Top level tags
        for (let tagId of tagIds) {
          ReactionCore.Collections.Tags.update(tagId, {
            $set: {
              position: tagIds.indexOf(tagId)
            }
          });
        }
      } else {
        // Sub tags
        ReactionCore.Collections.Tags.update(parentTag._id, {
          $set: {
            relatedTagIds: tagIds
          }
        });
      }
    }
  },

  removeTag(tag, parentTag) {
    if (_.isEmpty(parentTag) === false) {
      ReactionCore.Collections.Tags.update(parentTag._id,
        {
          $pullAll: {
            relatedTagIds: [tag._id]
          }
        }
      );
    } else if (tag.isTopLevel === true) {
      ReactionCore.Collections.Tags.update(tag._id,
        {
          $set: {
            isTopLevel: false
          }
        }
      );
    }
  }
};