export default () => ({
  port: parseInt(process.env.PORT!, 10) || 3000,
  database: {
    url: process.env.DATABASE_URL,
    port: parseInt(process.env.DATABASE_PORT!, 10) || 5432,
  },
  jwt_secret: 'jwt_secret',
});
