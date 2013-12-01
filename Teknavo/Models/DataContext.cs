using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web;

namespace Teknavo.Models
{
    public class DataContext : DbContext
    {
        public DataContext()
            : base("DefaultConnection")
        {
        }

        public DbSet<Matrix> Matrix { get; set; }
        public DbSet<MatrixElement> MatrixElements { get; set; }
    }
}