using System.ComponentModel.DataAnnotations;

namespace Teknavo.Models
{
    public class MatrixElement
    {
        public int MatrixElementId { get; set; }
        [Required]
        public short Value { get; set; }
        [Required]
        public int Index { get; set; }
        public int MatrixId { get; set; }

        public virtual Matrix Matrix { get; set; }
    }
}