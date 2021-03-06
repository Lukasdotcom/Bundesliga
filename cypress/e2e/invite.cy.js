describe("Invite User into league and change some league Settings and run through a matchday.", () => {
  before(() => {
    cy.exec("export NODE_ENV=test; node cypress/e2e/invite1.mjs");
  });
  // Used to signup change username and password and login again
  it("invite", () => {
    let user1;
    let user2;
    // Signs in
    cy.visit("http://localhost:3000");
    cy.contains("Sign In/Sign Up").click();
    cy.get("#input-username-for-Sign\\ Up-provider").type("Invite 1");
    cy.get("#input-password-for-Sign\\ Up-provider").type("password");
    cy.contains("Sign in with Sign Up").click();
    // Creates league with alternate starting amount
    cy.getCookie("next-auth.session-token").then(
      (cookie) => (user1 = cookie.value)
    );
    cy.get("#startingMoney").clear().type(200);
    cy.get("#name").type("Sample League");
    cy.get("button").contains("Create League").click();
    // Creates invites and deletes the randomly generated one
    cy.contains("Sample League").click();
    cy.contains("Add Invite").click();
    cy.get("#invite").type("invite1");
    cy.contains("Add Invite").click();
    cy.contains("Link: localhost:3000/api/invite/").contains("Delete").click();
    cy.contains("Link: localhost:3000/api/invite/invite1");
    // Changes the default money amount
    cy.get("#startingMoney").clear().type(100);
    cy.contains("Save all Admin Settings").click();
    // Signs into User 2 which will join the league through the invite
    cy.contains("Sign Out").click();
    cy.get("#input-username-for-Sign\\ Up-provider").type("Invite 2");
    cy.get("#input-password-for-Sign\\ Up-provider").type("password");
    cy.contains("Sign in with Sign Up").click();
    cy.getCookie("next-auth.session-token").then(
      (cookie) => (user2 = cookie.value)
    );
    // Checks invalid invite
    cy.visit("http://localhost:3000/api/invite/invite2", {
      failOnStatusCode: false,
    });
    cy.get(".center").contains("404");
    // Joins the league
    cy.visit("http://localhost:3000/api/invite/invite1");
    cy.contains("Admin Panel").should("not.exist");
    // Purchases Lewandoski for 25.8 million
    cy.contains("Transfer").click();
    cy.contains("Money left: 100M");
    cy.contains("Buy for 25.8 M").click();
    cy.contains("Buying for 25.8 M");
    cy.contains("Money left: 74.2M");
    // Switches to user 1
    cy.contains("Standings")
      .click()
      .then(() => {
        cy.setCookie("next-auth.session-token", user1);
      })
      .then(() => {
        cy.reload();
      });
    // Gives other user admin rights
    cy.get('[type="checkbox"]').check();
    cy.contains("Save all Admin Settings").click();
    // Outbides Lewandoski purchase
    cy.contains("Transfer").click();
    cy.contains("Money left: 200M");
    cy.contains("Buy for 25.9 M by outbidding Invite 2").click();
    cy.contains("Buying for 25.9 M");
    cy.contains("Money left: 174.1M");
    cy.contains("Unlimited transfers left");
    // Switches to user 2
    cy.contains("Standings")
      .click()
      .then(() => {
        cy.setCookie("next-auth.session-token", user2);
      })
      .then(() => {
        cy.reload();
      });
    // Changes the amount of times a player can be in a squad and buys lewandowski
    cy.get("#duplicatePlayers").clear().type(2);
    cy.contains("Save all Admin Settings").click();
    cy.contains("Transfer").click();
    cy.contains("Unlimited transfers left");
    cy.contains("Money left: 100M");
    cy.contains("Buy for 25.8 M").click();
    cy.contains("Buying for 25.8 M");
    cy.contains("Money left: 74.2M");
    // Buys players until out of money
    cy.contains("Buy for 21 M").click();
    cy.contains("Buy for 20.1 M").click();
    cy.contains("Buy for 19.7 M").click();
    cy.contains("You need 19.3 M");
    cy.contains("Money left: 13.4M");
    // Starts the matchday
    cy.exec("export NODE_ENV=test; node cypress/e2e/invite2.mjs").then(() => {
      cy.reload();
    });
    cy.contains("Transfer Market Closed");
    cy.contains("Transfer Market is Closed");
    // Looks at the squad and moves some players around
    cy.contains("Squad").click();
    cy.get("#formation").select("5-4-1");
    cy.contains("Robert Lewandowski")
      .parent()
      .parent()
      .children(".playerButton")
      .children("button")
      .click();
    cy.contains("Erling Haaland")
      .parent()
      .parent()
      .children(".playerButton")
      .children("button")
      .contains("Position is Full");
    cy.contains("Christopher Nkunku")
      .parent()
      .parent()
      .children(".playerButton")
      .children("button")
      .click();
    cy.get("#formation").select("4-4-2");
    cy.contains("Erling Haaland")
      .parent()
      .parent()
      .children(".playerButton")
      .children("button")
      .click();
    cy.contains("Christopher Nkunku")
      .parent()
      .parent()
      .children(".playerButton")
      .children("button")
      .contains("Move to Bench");
    // Sims matchday until all players have played
    cy.exec("export NODE_ENV=test; node cypress/e2e/invite3.mjs");
    // Checks that the user points are correct
    cy.contains("Standings").click();
    cy.get("tbody > :nth-child(2) > :nth-child(2)").contains("22");
    cy.get("tbody > :nth-child(3) > :nth-child(2)").contains("0");
    cy.get("#matchday").invoke("val", 1).trigger("change");
    cy.get("tbody > :nth-child(2) > :nth-child(2)").contains("22");
    cy.get("tbody > :nth-child(3) > :nth-child(2)").contains("0");
    // Moves a player to the bench
    cy.contains("Squad").click();
    cy.contains("Christopher Nkunku")
      .parent()
      .parent()
      .children(".playerButton")
      .children("button")
      .contains("Move to Bench")
      .click();
    cy.contains("Standings").click();
    // Checks if the points got updated
    cy.get("tbody > :nth-child(2) > :nth-child(2)").contains("12");
    cy.get("tbody > :nth-child(3) > :nth-child(2)").contains("0");
    cy.get("#matchday").invoke("val", 1).trigger("change");
    cy.get("tbody > :nth-child(2) > :nth-child(2)").contains("12");
    cy.get("tbody > :nth-child(3) > :nth-child(2)").contains("0");
    // Checks Nkunku button
    cy.contains("Squad").click();
    cy.contains("Christopher Nkunku")
      .parent()
      .parent()
      .children(".playerButton")
      .children("button")
      .contains("Player has Already Played");
    // Starts the transfer period and sells Muller
    cy.exec("export NODE_ENV=test; node cypress/e2e/invite4.mjs");
    cy.contains("Transfer").click();
    cy.contains("Sell for: 21 M").click();
    // Switches user and sets the duplicate players setting to 1
    cy.contains("Money left: 34.4M")
      .then(() => {
        cy.setCookie("next-auth.session-token", user1);
      })
      .then(() => {
        cy.contains("Standings").click();
      });
    cy.get("#duplicatePlayers").clear().type(1);
    cy.contains("Save all Admin Settings").click();
    cy.contains("Squad").click();
    // Checks if this user has Lewandowski still
    cy.contains("Robert Lewandowski")
      .parent()
      .parent()
      .children(".playerButton")
      .children("button")
      .click();
    // Purchases Mueller and checks if Nkunku is purchasable
    cy.contains("Transfer").click();
    cy.contains("Buy for 21.1 M").click();
    cy.contains("Christopher Nkunku")
      .parent()
      .parent()
      .children(".playerButton")
      .children("button")
      .contains("Player not for Sale");
    cy.contains("Money left: 153M");
    // Has both players leave the league
    cy.contains("Home").click();
    cy.contains("Leave League")
      .click()
      .then(() => {
        cy.setCookie("next-auth.session-token", user2);
      })
      .then(() => {
        cy.reload();
      });
    cy.contains("Leave League").click();
    cy.contains("Sign Out").click();
    // Checks if the league is actually deleted
    cy.contains("Sign In/Sign Up").click();
    cy.get("#input-username-for-Sign\\ Up-provider").type("Invite 3");
    cy.get("#input-password-for-Sign\\ Up-provider").type("password");
    cy.contains("Sign in with Sign Up").click();
    cy.visit("http://localhost:3000/api/invite/invite1", {
      failOnStatusCode: false,
    });
    cy.get(".center").contains("404");
  });
});
