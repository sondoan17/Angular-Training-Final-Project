const Testimonials = () => {
    const testimonials = [
      {
        name: "John Doe",
        role: "Project Manager",
        image: "https://res.cloudinary.com/db2tvcbza/image/upload/v1731307832/user-1_am8swh.png",
        quote: "Planify has transformed how our team collaborates. The intuitive interface and powerful features have significantly improved our productivity."
      },
      {
        name: "Sarah Smith",
        role: "Team Lead",
        image: "https://res.cloudinary.com/db2tvcbza/image/upload/v1731307831/user-2_bnwswg.png",
        quote: "The task tracking and team collaboration features are exceptional. It's made our remote work seamless and keeps everyone aligned on project goals."
      },
      {
        name: "Mike Johnson",
        role: "Product Owner",
        image: "https://res.cloudinary.com/db2tvcbza/image/upload/v1731307833/user-5_lr06fi.png",
        quote: "The analytics and reporting features give us valuable insights into our project progress. It's helped us identify bottlenecks and improve our workflow."
      }
    ];
  
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            What Our Users Say
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    crossOrigin="anonymous"
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700">{testimonial.quote}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };
  
  export default Testimonials;