using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Teknavo.Models
{
    public class Matrix
    {
        public int MatrixId { get; set; }
        [Required]
        public int Dimension { get; set; }
        [Required]
        public string Description { get; set; }

        public virtual ICollection<MatrixElement> Elements { get; set; }
    }
}