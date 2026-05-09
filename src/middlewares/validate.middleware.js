export const validate = (schema, source = "body") => {
  return async (request, reply) => {
    try {
      let dataToValidate;

      if (source === "file") {
        const fields = {};
        // We iterate through parts to get fields for validation
        // Note: this consumes the stream, so we must store the file buffer
        for await (const part of request.parts()) {
          if (part.file) {
            const buffer = await part.toBuffer();
            request.fileData = {
              buffer: buffer,
              filename: part.filename,
              mimetype: part.mimetype,
            };
            continue;
          } else {
            fields[part.fieldname] = part.value;
          }
        }

        dataToValidate = fields;
      } else {
        dataToValidate = request[source];
      }
      const validatedData = await schema.parseAsync(dataToValidate);

      // Update the request body with validated data
      if (source === "file") {
        request.body = validatedData;
      } else {
        request[source] = validatedData;
      }
    } catch (error) {
      return reply.status(400).send({
        success: false,
        message: "Validation failed",
        errors: error.errors
          ? error.errors.map((e) => ({
              path: e.path.join("."),
              message: e.message,
            }))
          : error.message,
      });
    }
  };
};