export const notFound = (req, res) => {
  return res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Cannot ${req.method} ${req.originalUrl} - Endpoint not found on Campus Life API`
    }
  });
};

export default notFound;
