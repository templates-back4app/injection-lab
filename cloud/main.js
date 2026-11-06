// Validation on the way in. Switched by an environment variable so the lab can
// measure the same comment being accepted and refused.
if (process.env.GUARD_INPUT === 'true') {
  Parse.Cloud.beforeSave('Comment', (req) => {
    const body = String(req.object.get('body') ?? '');
    if (/<[a-z!\/]/i.test(body)) {
      throw new Parse.Error(142, 'comments are text, not markup');
    }
  });
}
