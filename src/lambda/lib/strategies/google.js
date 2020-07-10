import { Router } from "express";
import passport from "passport";
import { Strategy } from "passport-saml";
import get from "lodash/fp/get";

const router = Router();

router.use((req, _res, next) => {
  const {
    query: { host }
  } = req;

  // Note: Netlify functions don't have the host url, so we need to pass it explicitly
  if (!passport._strategy(Strategy.name) && host) {
    console.log(`Init saml auth strategy on host ${host}`);

    passport.use(new Strategy(
      {
        path: '/saml/callback',
        entryPoint: 'https://openidp.feide.no/simplesaml/saml2/idp/SSOService.php',
        issuer: 'passport-saml'
      },
      function(profile, done) {
        console.log(`xxx2 done ${done}`, profile)
      })
    );
  }
  next();
});

router.get(
  "/saml",
  passport.authenticate("saml", {
    scope: [
      "https://www.samlapis.com/auth/userinfo.profile",
      "https://www.samlapis.com/auth/userinfo.email"
    ]
  })
);

router.get(
  "/saml/callback",
  passport.authenticate("saml", { failureRedirect: "/" }),
  function callback(req, res) {
    console.log(`xxx2 login user`, req);
    console.log(`login user ${req.user && req.user.id} and redirect`);

    return req.login(req.user, async function callbackLogin(loginErr) {
      if (loginErr) {
        throw loginErr;
      }
      return res.redirect("/");
    });
  }
);

export default router;
