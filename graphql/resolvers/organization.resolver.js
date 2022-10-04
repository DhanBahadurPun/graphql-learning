module.exports = {
  Query: {
    async getAllOrganizations(parent, args, { models: { OrganizationModel } }) {
      const organizations = await OrganizationModel.find({});
      console.log(organizations);
      return organizations;
    },
  },

  Mutation: {
    async createOrganization(parent, { input }, { models }) {
      const { OrganizationModel } = models;

      const organization = new OrganizationModel();
      organization.name = input.name;
      organization.type = input.category;
      organization.contact_no = input.contact;
      organization.district = input.district;
      organization.city = input.city;
      organization.address = input.address;
      organization.facilities = input.facilities;
      organization.rules = input.rules;
      await organization.save();
      return "Organization Created Successfully!";
    },
  },
};
